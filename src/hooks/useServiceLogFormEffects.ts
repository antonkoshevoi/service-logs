import { useEffect, useRef, useState } from 'react';
import { UseFormSetValue, UseFormReset } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateDraft,
  saveDraft,
  setFormData,
} from '../store/slices/serviceLogsSlice';
import { ServiceLogFormData } from '../types';

interface UseServiceLogFormEffectsProps {
  formValues: ServiceLogFormData;
  startDate: string;
  setValue: UseFormSetValue<ServiceLogFormData>;
  reset: UseFormReset<ServiceLogFormData>;
  getInitialValues: () => ServiceLogFormData;
  emptyForm: ServiceLogFormData;
}

export const useServiceLogFormEffects = ({
  formValues,
  startDate,
  setValue,
  reset,
  getInitialValues,
}: UseServiceLogFormEffectsProps) => {
  const dispatch = useAppDispatch();
  const { drafts, currentDraftId } = useAppSelector((state) => state.serviceLogs);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [draftUpdateTimeout, setDraftUpdateTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedFormValuesRef = useRef<ServiceLogFormData | null>(null);
  const isSavingRef = useRef(false);
  const draftsRef = useRef(drafts);

  useEffect(() => {
    if (isInitialized) return;

    const timer = setTimeout(() => {
      const initialValues = getInitialValues();
      reset(initialValues);
      lastSavedFormValuesRef.current = { ...initialValues };
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      setValue('endDate', end.toISOString().split('T')[0]);
    }
  }, [startDate, setValue]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    if (!isInitialized) return;

    const formValuesString = JSON.stringify(formValues);
    const lastSavedString = lastSavedFormValuesRef.current ? JSON.stringify(lastSavedFormValuesRef.current) : null;

    if (formValuesString === lastSavedString) {
      return;
    }

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      dispatch(setFormData(formValues));
      lastSavedFormValuesRef.current = { ...formValues };
    }, 300);

    if (currentDraftId && !isSavingRef.current) {
      if (draftUpdateTimeout) {
        clearTimeout(draftUpdateTimeout);
      }

      const draftTimeout = setTimeout(() => {
        const currentDraft = draftsRef.current.find(d => d.id === currentDraftId);
        if (currentDraft && !isSavingRef.current) {
          const hasChanges =
              JSON.stringify({
                ...currentDraft,
                id: undefined,
                isSaved: undefined,
                lastSaved: undefined,
              }) !== JSON.stringify(formValues);

          if (hasChanges) {
            isSavingRef.current = true;
            setSaveStatus('saving');
            dispatch(
              updateDraft({
                id: currentDraftId,
                ...formValues,
              })
            );
            setTimeout(() => {
              dispatch(saveDraft({ id: currentDraftId }));
              setSaveStatus('saved');
              setTimeout(() => {
                setSaveStatus('idle');
                isSavingRef.current = false;
              }, 2000);
            }, 100);
          }
        }
      }, 1000);

      setDraftUpdateTimeout(draftTimeout);
    }

    setAutoSaveTimeout(timeout);

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      if (draftUpdateTimeout) {
        clearTimeout(draftUpdateTimeout);
      }
    };
  }, [formValues, currentDraftId, isInitialized, dispatch]);

  return {
    saveStatus,
    lastSavedFormValuesRef,
  };
};

