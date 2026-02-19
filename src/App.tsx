import { Container, Box, Typography } from '@mui/material';
import { ServiceLogForm } from './components/ServiceLogForm';
import { ServiceLogsTable } from './components/ServiceLogsTable';

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Service Logs Management
      </Typography>
      <Box sx={{ mt: 4 }}>
        <ServiceLogForm />
        <ServiceLogsTable />
      </Box>
    </Container>
  );
}

export default App;

