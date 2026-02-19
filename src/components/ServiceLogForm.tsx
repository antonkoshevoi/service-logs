import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import { PlayArrow as UseIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createDraft,
  deleteDraft,
  clearAllDrafts,
  createServiceLog,
  setCurrentDraftId,
  setFormData,
} from '../store/slices/serviceLogsSlice';
import { ServiceLogFormData, ServiceType, ServiceLogDraft } from '../types';
import { serviceLogSchema } from '../schemas/serviceLogSchema';
import { getDefaultDates } from '../helpers/dateHelpers';
import { useServiceLogFormEffects } from '../hooks/useServiceLogFormEffects';

export const ServiceLogForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drafts, currentDraftId, formData } = useAppSelector((state) => state.serviceLogs);

  const defaultDates = getDefaultDates();
  const currentDraft = currentDraftId ? drafts.find(d => d.id === currentDraftId) : null;

  const emptyForm: ServiceLogFormData = {
    providerId: '',
    serviceOrder: '',
    carId: '',
    odometer: 0,
    engineHours: 0,
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    type: 'planned' as ServiceType,
    serviceDescription: '',
  };

  const getInitialValues = (): ServiceLogFormData => {
    if (formData) {
      return formData;
    }
    if (currentDraft) {
      return currentDraft;
    }
    return emptyForm;
  };

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
    defaultValues: getInitialValues(),
  });

  const startDate = watch('startDate');
  const formValues = watch();

  const { saveStatus, lastSavedFormValuesRef } = useServiceLogFormEffects({
    formValues,
    startDate,
    setValue,
    reset,
    getInitialValues,
    emptyForm,
  });

  const handleCreateDraft = () => {
    const draftId = `draft-${Date.now()}`;
    dispatch(
      createDraft({
        id: draftId,
        ...formValues,
        isSaved: true,
        lastSaved: new Date().toISOString(),
      })
    );
    reset(emptyForm);
    dispatch(setFormData(emptyForm));
    dispatch(setCurrentDraftId(null));
    if (lastSavedFormValuesRef.current) {
      lastSavedFormValuesRef.current = { ...emptyForm };
    }
  };

  const handleDeleteDraft = () => {
    if (currentDraftId) {
      dispatch(deleteDraft({ id: currentDraftId }));
      reset(emptyForm);
      dispatch(setFormData(emptyForm));
      dispatch(setCurrentDraftId(null));
    }
  };

  const handleClearAllDrafts = () => {
    dispatch(clearAllDrafts());
    reset(emptyForm);
    dispatch(setFormData(emptyForm));
  };

  const onSubmit = (data: ServiceLogFormData) => {
    const serviceLog = {
      ...data,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch(createServiceLog(serviceLog));
    reset(emptyForm);
    dispatch(setFormData(emptyForm));
    if (currentDraftId) {
      dispatch(deleteDraft({ id: currentDraftId }));
      dispatch(setCurrentDraftId(null));
    }
    alert('Service log created successfully!');
  };

  const handleSelectDraft = (draftId: string) => {
    dispatch(setCurrentDraftId(draftId));
  };

  const handleUseDraft = (draft: ServiceLogDraft) => {
    reset(draft);
    dispatch(setFormData(draft));
    dispatch(setCurrentDraftId(draft.id));
    lastSavedFormValuesRef.current = { ...draft };
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Service Log Form</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {saveStatus === 'saving' && (
            <>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Saving...
              </Typography>
            </>
          )}
          {saveStatus === 'saved' && currentDraftId && (
            <Chip label="Draft saved" color="success" size="small" />
          )}
          {currentDraftId && (
            <Chip
              label={`Draft: ${currentDraftId.slice(-6)}`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Box>

      {drafts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Drafts ({drafts.length}):
          </Typography>
          <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 150, overflow: 'auto' }}>
            {drafts.map((draft, index) => (
              <React.Fragment key={draft.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={draft.id === currentDraftId}
                    onClick={() => handleSelectDraft(draft.id)}
                  >
                    <ListItemText
                      primary={`Draft ${draft.id.slice(-6)}`}
                      secondary={`${draft.providerId || 'Empty'} - ${draft.serviceOrder || 'Empty'}`}
                    />
                    {draft.isSaved && (
                      <Chip
                        icon={<span>✓</span>}
                        label="Saved"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItemButton>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="use"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseDraft(draft);
                      }}
                      size="small"
                    >
                      <UseIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < drafts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
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

        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleCreateDraft}>
            Create Draft
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteDraft}
            disabled={!currentDraftId}
          >
            Delete Draft
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAllDrafts}
            disabled={drafts.length === 0}
          >
            Clear All Drafts
          </Button>
          <Button variant="contained" type="submit">
            Create Service Log
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

