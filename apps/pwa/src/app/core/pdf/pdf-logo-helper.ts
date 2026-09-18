import jsPDF from 'jspdf';

export class PdfLogoHelper {
  /**
   * Responsabilidad Única: Renderizar el logotipo corporativo oficial de Fildlab Perú S.A.C.
   * Si no se encuentra archivo en disco, genera un membrete vectorial de alta resolución.
   */
  static async renderLogoOrFallback(doc: jsPDF, logoBase64?: string): Promise<void> {
    if (!logoBase64 && typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const response = await fetch('/assets/images/fildlab-logo.png');
        if (response.ok) {
          const blob = await response.blob();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        // Continúa al membrete vectorial si hay error de red
      }
    }

    if (logoBase64 && logoBase64.startsWith('data:image')) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 36, 18);
      return;
    }

    // Membrete vectorial corporativo de contingencia (Azul Cian Fildlab)
    doc.setFillColor(2, 132, 199); // #0284c7 (Fildlab Blue)
    doc.roundedRect(14, 12, 16, 16, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('F', 19, 23);

    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(12);
    doc.text('FILDLAB PERÚ S.A.C.', 34, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('Sistemas de Tratamiento y Purificación de Agua | RUC: 20612493821', 34, 23);
    doc.text('Trujillo - La Libertad, Perú | Soporte Especializado Sector Salud', 34, 27);
  }
}
