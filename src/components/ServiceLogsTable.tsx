import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteServiceLog, updateServiceLog } from '../store/slices/serviceLogsSlice';
import { ServiceLog, ServiceType } from '../types';
import { ServiceLogEditDialog } from './ServiceLogEditDialog';

export const ServiceLogsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs } = useAppSelector((state) => state.serviceLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ServiceLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.providerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.serviceOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.carId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || log.type === typeFilter;

      const matchesDateRange =
        (!startDateFilter || log.startDate >= startDateFilter) &&
        (!endDateFilter || log.startDate <= endDateFilter);

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [logs, searchTerm, typeFilter, startDateFilter, endDateFilter]);

  const handleEdit = (log: ServiceLog) => {
    setSelectedLog(log);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service log?')) {
      dispatch(deleteServiceLog({ id }));
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedLog(null);
  };

  const handleEditSave = (updatedLog: ServiceLog) => {
    dispatch(updateServiceLog(updatedLog));
    handleEditClose();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Service Logs
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="unplanned">Unplanned</MenuItem>
            <MenuItem value="emergency">Emergency</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Start Date From"
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="Start Date To"
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider ID</TableCell>
              <TableCell>Service Order</TableCell>
              <TableCell>Car ID</TableCell>
              <TableCell>Odometer (mi)</TableCell>
              <TableCell>Engine Hours</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary">No service logs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.providerId}</TableCell>
                  <TableCell>{log.serviceOrder}</TableCell>
                  <TableCell>{log.carId}</TableCell>
                  <TableCell>{log.odometer}</TableCell>
                  <TableCell>{log.engineHours}</TableCell>
                  <TableCell>{log.startDate}</TableCell>
                  <TableCell>{log.endDate}</TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.serviceDescription}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(log)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(log.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedLog && (
        <ServiceLogEditDialog
          open={editDialogOpen}
          log={selectedLog}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
    </Paper>
  );
};

