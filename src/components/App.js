import React from 'react';
import { Container } from '@mui/material';
import UnderAppBarContainer from './Wrapper/UnderAppBarContainer';
import AppBarNavContainer from './AppBarNav/AppBarNavContainer';
import Loading from '../utils/Loading';
import Error from '../utils/Error';

function App({loading,error}) {
  return (
    <Container  style={{ maxWidth:"1800px" ,display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5'}}>
     {loading && <Loading loading={loading} />}
     {/* {error && <Error error={error} />} */}
      <AppBarNavContainer />
      <UnderAppBarContainer />
    </Container>
  );
}

export default App;