import * as yup from 'yup';

export const serviceLogSchema = yup.object().shape({
  providerId: yup.string().required('Provider ID is required'),
  serviceOrder: yup.string().required('Service order is required'),
  carId: yup.string().required('Car ID is required'),
  odometer: yup.number().required('Odometer is required').min(0, 'Odometer must be positive'),
  engineHours: yup.number().required('Engine hours is required').min(0, 'Engine hours must be positive'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  type: yup.string().oneOf(['planned', 'unplanned', 'emergency']).required('Type is required'),
  serviceDescription: yup.string().required('Service description is required'),
});

