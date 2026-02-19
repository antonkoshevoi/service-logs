import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
} from '@mui/material';
import { ServiceLog, ServiceLogFormData } from '../types';
import { serviceLogSchema } from '../schemas/serviceLogSchema';

interface ServiceLogEditDialogProps {
  open: boolean;
  log: ServiceLog;
  onClose: () => void;
  onSave: (log: ServiceLog) => void;
}

export const ServiceLogEditDialog: React.FC<ServiceLogEditDialogProps> = ({
  open,
  log,
  onClose,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<ServiceLogFormData>({
    resolver: yupResolver(serviceLogSchema),
    defaultValues: {
      providerId: log.providerId,
      serviceOrder: log.serviceOrder,
      carId: log.carId,
      odometer: log.odometer,
      engineHours: log.engineHours,
      startDate: log.startDate,
      endDate: log.endDate,
      type: log.type,
      serviceDescription: log.serviceDescription,
    },
  });

  const startDate = watch('startDate');

  useEffect(() => {
    reset({
      providerId: log.providerId,
      serviceOrder: log.serviceOrder,
      carId: log.carId,
      odometer: log.odometer,
      engineHours: log.engineHours,
      startDate: log.startDate,
      endDate: log.endDate,
      type: log.type,
      serviceDescription: log.serviceDescription,
    });
  }, [log, reset]);

  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      setValue('endDate', end.toISOString().split('T')[0]);
    }
  }, [startDate, setValue]);

  const onSubmit = (data: ServiceLogFormData) => {
    onSave({
      ...log,
      ...data,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Service Log</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provider ID"
                {...register('providerId')}
                error={!!errors.providerId}
                helperText={errors.providerId?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Order"
                {...register('serviceOrder')}
                error={!!errors.serviceOrder}
                helperText={errors.serviceOrder?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Car ID"
                {...register('carId')}
                error={!!errors.carId}
                helperText={errors.carId?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Odometer (mi)"
                type="number"
                {...register('odometer', { valueAsNumber: true })}
                error={!!errors.odometer}
                helperText={errors.odometer?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Engine Hours"
                type="number"
                {...register('engineHours', { valueAsNumber: true })}
                error={!!errors.engineHours}
                helperText={errors.engineHours?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register('startDate')}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register('endDate')}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Type</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Type">
                      <MenuItem value="planned">Planned</MenuItem>
                      <MenuItem value="unplanned">Unplanned</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  )}
                />
                {errors.type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.type.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Description"
                multiline
                rows={4}
                {...register('serviceDescription')}
                error={!!errors.serviceDescription}
                helperText={errors.serviceDescription?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

