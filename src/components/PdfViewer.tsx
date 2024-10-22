import { useEffect } from 'react';
import PSPDFKit from 'pspdfkit';

const PdfViewer = () => {
  useEffect(() => {
    (async () => {
      const container = document.getElementById('pspdfkit');

      if (container) {
        await PSPDFKit.load({
          container,
          document: 'path/to/your/document.pdf', // Stien til PDF-en du vil vise
          licenseKey: 'DIN_PSPDFKIT_LISENSNØKKEL', // Sett inn din lisensnøkkel
        });
      }
    })();

    return () => PSPDFKit.unload('#pspdfkit');
  }, []);

  return <div id="pspdfkit" style={{ width: '100%', height: '100vh' }} />;
};

export default PdfViewer;