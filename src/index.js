import React from "react";
// import { createRoot } from 'react-dom/client';
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import AppContainer from "./components/AppContainer";
import ReactDOM from 'react-dom/client';
import{ Toaster } from 'sonner'
import { createTheme } from '@mui/material/styles';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderRadius: '14px',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    {/* <ThemeProvider theme={darkTheme}> */}
      <CssBaseline />
      <AppContainer />
      <Toaster />
    {/* </ThemeProvider> */}
  </Provider>
);