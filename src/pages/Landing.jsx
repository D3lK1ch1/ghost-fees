import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '@/components/site/BrandHeader';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import UploadPanel from '@/components/scan/UploadPanel';
import ScanningScreen from '@/components/scan/ScanningScreen';
import { useScan } from '@/lib/ScanContext';

export default function Landing() {
  const navigate = useNavigate();
  const { status, steps, progress, transactionCount, fileCount, fileErrors, runScan, reset } = useScan();
  const [files, setFiles] = useState([]);
  const [bankId, setBankId] = useState('anz');

  useEffect(() => {
    reset();
  }, [reset]);

  const startScan = async (useSample) => {
    const outcome = await runScan({ files, bankId, useSample });
    if (outcome) navigate('/results');
    else setFiles([]);
  };

  if (status === 'scanning' || status === 'done') {
    return (
      <ScanningScreen
        steps={steps}
        progress={progress}
        transactionCount={transactionCount}
        fileCount={fileCount}
        onCancel={reset}
      />
    );
  }

  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen">
      <BrandHeader
        right={(
          <a
            href="#how-it-works"
            className="rounded-xl px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-white"
          >
            How it works
          </a>
        )}
      />

      <Hero onSample={() => startScan(true)} onUpload={scrollToUpload} />

      <div className="mt-16 sm:mt-20">
        <UploadPanel
          bankId={bankId}
          onBankChange={setBankId}
          files={files}
          onFilesChange={setFiles}
          onScan={() => startScan(false)}
          onSample={() => startScan(true)}
          errors={fileErrors}
        />
      </div>

      <HowItWorks />
    </div>
  );
}