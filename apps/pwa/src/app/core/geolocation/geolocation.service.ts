import { Injectable } from '@angular/core';

export interface GpsPositionResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestampIso: string;
}

export interface GpsState {
  resolved: boolean;
  position?: GpsPositionResult;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  /**
   * Responsabilidad Única: Comunicación con la Geolocation API del dispositivo
   * y resolución de coordenadas GPS con alta precisión para cumplimiento de la Ley N° 27269.
   */
  async getCurrentPosition(): Promise<GpsPositionResult> {
    if (!('geolocation' in navigator)) {
      throw new Error('El dispositivo no cuenta con hardware o soporte de geolocalización.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestampIso: new Date(position.timestamp).toISOString(),
          });
        },
        (error) => {
          let message = 'Error desconocido al obtener GPS';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado por el usuario en el dispositivo.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Señal de satélite GPS no disponible en la ubicación actual.';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado al intentar conectar con satélites GPS.';
              break;
          }
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }
}
