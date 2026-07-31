import { userApi, API_BASE_URL } from './client';

/**
 * Download the PDF for an assessment.
 * The backend returns a binary stream (not JSON), so we use axios directly
 * with a blob responseType.
 */
export async function downloadReport(assessmentId) {
  const token = localStorage.getItem('humascale_user_token');
  const response = await userApi.get(`/report/${assessmentId}/download`, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Get filename from Content-Disposition if present, otherwise default
  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
  const filename = match
    ? decodeURIComponent(match[1])
    : `humascale_report_${assessmentId}.pdf`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const reportApi = {
  status: (assessmentId) =>
    userApi.get(`/report/${assessmentId}/status`).then((r) => r.data),
  /**
   * Build a direct URL to the PDF (for the inline <iframe> viewer).
   * Caller must inject the bearer token in the parent request.
   */
  pdfUrl: (assessmentId) =>
    `${API_BASE_URL}/report/${assessmentId}/download`,
};
