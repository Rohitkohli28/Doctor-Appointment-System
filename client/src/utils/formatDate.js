import { format } from 'date-fns';

export const formatDate = (dateString, formatStr = 'PPP') => {
  if (!dateString) return '';
  return format(new Date(dateString), formatStr);
};
