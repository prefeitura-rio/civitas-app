import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const Error = ({error}) => {
  const [erro, setErro] = useState(false);
  return (
    <Snackbar
      open={erro}
      autoHideDuration={6000}
      onClose={() => setErro(false)}
      message="Aconteceu um erro!"
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => setErro(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
}

export default Error