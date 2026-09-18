import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PwaFieldTabComponent } from '../pwa-field/pwa-field-tab.component.js';
import { SyncEngineService } from '../../core/offline/sync-engine.service.js';

@Component({
  selector: 'app-pwa-standalone',
  standalone: true,
  imports: [CommonModule, RouterModule, PwaFieldTabComponent],
  templateUrl: './pwa-standalone.component.html',
})
export class PwaStandaloneComponent implements OnInit {
  isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  showInstallBanner = signal<boolean>(false);
  isIos = signal<boolean>(false);
  showIosHint = signal<boolean>(false);
  isStandalone = signal<boolean>(false);
  private deferredPrompt: any = null;

  constructor(readonly syncEngine: SyncEngineService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));

      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;
      this.isStandalone.set(isStandaloneMode);

      const wasDismissed = localStorage.getItem('fildlab_install_dismissed') === 'true';

      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      this.isIos.set(isIosDevice);
      if (isIosDevice && !isStandaloneMode && !wasDismissed) {
        this.showIosHint.set(true);
      }

      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e;
        if (!isStandaloneMode && !wasDismissed) {
          this.showInstallBanner.set(true);
        }
      });

      window.addEventListener('appinstalled', () => {
        this.showInstallBanner.set(false);
        this.isStandalone.set(true);
        localStorage.setItem('fildlab_install_dismissed', 'true');
        this.deferredPrompt = null;
      });
    }
  }

  async installPwa(): Promise<void> {
    localStorage.setItem('fildlab_install_dismissed', 'true');
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.showInstallBanner.set(false);
      }
      this.deferredPrompt = null;
    } else {
      this.showInstallBanner.set(false);
      alert('Para instalar esta aplicación:\n1. Pulsa el menú de opciones (⋮) de tu navegador.\n2. Selecciona "Instalar aplicación" o "Añadir a la pantalla de inicio".');
    }
  }

  dismissInstallBanner(): void {
    localStorage.setItem('fildlab_install_dismissed', 'true');
    this.showInstallBanner.set(false);
  }

  dismissIosHint(): void {
    localStorage.setItem('fildlab_install_dismissed', 'true');
    this.showIosHint.set(false);
  }

  manualSync(): void {
    this.syncEngine.processPendingSyncQueue();
  }
}

