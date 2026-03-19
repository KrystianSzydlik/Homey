import Button from '@/components/shared/Button';
import Pill from '@/components/shared/Pill';
import ScanIcon from '@/components/shared/icons/ScanIcon';
import styles from './ScannerPanel.module.scss';

export default function ScannerPanel() {
  return (
    <div className={styles.container}>
      <Pill className={styles.comingSoon}>Wkrótce</Pill>
      <div className={styles.viewfinder}>
        {/* SVG corner brackets */}
        <svg
          className={styles.corners}
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <path d="M10 40V10h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M160 10h30v30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M190 160v30h-30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 190H10v-30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <Button
        variant="primary"
        leftIcon={<ScanIcon size={18} />}
        disabled
      >
        Skanuj paragon
      </Button>
      <p className={styles.info}>
        Zeskanuj paragon, aby automatycznie dodać produkty do listy.
      </p>
    </div>
  );
}
