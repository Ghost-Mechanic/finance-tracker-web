import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingOverlay() {
  return (
    <Backdrop
      data-testid="loading-overlay"
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true} // The parent component will control this
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
