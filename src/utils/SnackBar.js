import { Alert, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ERASE_ERROR, eraseError } from '../redux/error/actions';

export default function SnackBar({ message, severity }) {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    dispatch(eraseError());

  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={severity ? severity : "error"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}