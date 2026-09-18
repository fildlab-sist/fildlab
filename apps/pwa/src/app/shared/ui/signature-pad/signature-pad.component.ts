import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitalSignatureMetadataDto } from '@fildlab/shared-dtos';
import { GeolocationService, GpsPositionResult } from '../../../core/geolocation/geolocation.service.js';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signature-pad.component.html',
})
export class SignaturePadComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() technicianId: string = 'tech-current';
  @Output() signatureCaptured = new EventEmitter<DigitalSignatureMetadataDto>();

  signerFullName: string = '';
  signerDniOrRuc: string = '';
  signerRole: string = '';

  latitude: number | null = null;
  longitude: number | null = null;
  accuracy: number | null = null;
  gpsResolved: boolean = false;
  gpsError: string | null = null;
  currentIsoTimestamp: string = new Date().toISOString();

  hasStrokes: boolean = false;
  validationMessage: string | null = null;

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  private strokes: Array<{ x: number; y: number; time: number }> = [];

  constructor(private readonly geoService: GeolocationService) {}

  ngOnInit(): void {
    this.acquireGpsCoordinates();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.scale(2, 2);
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  async acquireGpsCoordinates(): Promise<void> {
    try {
      const pos: GpsPositionResult = await this.geoService.getCurrentPosition();
      this.latitude = pos.latitude;
      this.longitude = pos.longitude;
      this.accuracy = pos.accuracy;
      this.currentIsoTimestamp = pos.timestampIso;
      this.gpsResolved = true;
      this.gpsError = null;
    } catch (err: any) {
      this.gpsResolved = false;
      this.gpsError = err.message || 'Error al conectar con satélites GPS';
    }
  }

  startDrawing(event: PointerEvent): void {
    if (!this.ctx) return;
    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.strokes.push({ x, y, time: Date.now() });
    this.hasStrokes = true;
    this.validationMessage = null;
  }

  draw(event: PointerEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.strokes.push({ x, y, time: Date.now() });
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.hasStrokes = false;
    this.strokes = [];
  }

  isFormValid(): boolean {
    return (
      this.hasStrokes &&
      this.signerFullName.trim().length > 3 &&
      this.signerDniOrRuc.trim().length >= 8 &&
      this.signerRole.trim().length > 2 &&
      this.gpsResolved &&
      this.latitude != null &&
      this.longitude != null
    );
  }

  confirmAndEmitSignature(): void {
    if (!this.isFormValid()) {
      this.validationMessage =
        'Imposible cerrar la orden: Debe registrar la firma manuscrita, completar los datos del firmante y autorizar la captura de coordenadas GPS.';
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const signatureImage = canvas.toDataURL('image/png');
    this.currentIsoTimestamp = new Date().toISOString();

    const metadata: DigitalSignatureMetadataDto = {
      signatureImage,
      vectorStrokes: this.strokes,
      latitude: this.latitude!,
      longitude: this.longitude!,
      accuracyMeters: this.accuracy ?? 10,
      timestampIso: this.currentIsoTimestamp,
      technicianId: this.technicianId,
      signerDniOrRuc: this.signerDniOrRuc.trim(),
      signerFullName: this.signerFullName.trim(),
      signerRole: this.signerRole.trim(),
    };

    this.signatureCaptured.emit(metadata);
  }
}
