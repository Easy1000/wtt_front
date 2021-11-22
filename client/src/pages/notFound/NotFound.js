import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';
import Footer from '../../components/Footer/Footer';

export default function NotFound() {
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" direction="column">
      <Grid item>
        <Typography variant="h1">
          404
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="subtitle1">
          Sorry, the page you were trying to view does not exist.
        </Typography>
      </Grid>
      <Footer />
    </Grid>
  );
}
