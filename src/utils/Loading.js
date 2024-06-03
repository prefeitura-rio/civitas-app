import React from 'react'
import { Backdrop, CircularProgress } from '@mui/material';

const Loading = ({loading}) => {
  return (
    <div>
      {/* Your other components here */}
      
      <Backdrop open={loading} style={{ color: '#fff', zIndex: 1500 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default Loading

