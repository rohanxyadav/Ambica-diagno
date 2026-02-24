import React, { useState, useEffect } from 'react';
import { adminAPI, reportsAPI } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

const ReportsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reportStatus, setReportStatus] = useState('ready');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setAllReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter search query');
      return;
    }
    setLoading(true);
    try {
      const response = await adminAPI.searchPatients(searchQuery);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        toast.info('No appointments found');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadFile(acceptedFiles[0]);
        toast.success('File selected');
      }
    }
  });

  const handleUpload = async () => {
    if (!selectedAppointment) {
      toast.error('Please select an appointment');
      return;
    }
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('patient_id', selectedAppointment.user_id);
      formData.append('appointment_id', selectedAppointment.id);
      formData.append('remarks', remarks);
      formData.append('status', reportStatus);

      await reportsAPI.upload(formData);
      toast.success('Report uploaded successfully!');
      
      setUploadFile(null);
      setRemarks('');
      setReportStatus('ready');
      setSelectedAppointment(null);
      setSearchResults([]);
      setSearchQuery('');
      fetchAllReports();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const response = await reportsAPI.download(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportsAPI.delete(reportId);
      toast.success('Report deleted successfully');
      fetchAllReports();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
          Upload New Report
        </h2>

        <Card className="p-6 space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-4 block">
              Step 1: Search Patient
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, phone, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                data-testid="search-patient-input"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                data-testid="search-patient-button"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Step 2: Select Appointment
              </Label>
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {searchResults.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAppointment?.id === appointment.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                    data-testid={`appointment-select-${appointment.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.user_name}</p>
                        <p className="text-sm text-slate-600">{appointment.test_name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Booking ID: {appointment.booking_id} | Date: {appointment.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{appointment.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAppointment && (
            <>
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  Step 3: Upload Report File
                </Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'
                  }`}
                  data-testid="file-dropzone"
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  {uploadFile ? (
                    <div>
                      <p className="font-semibold text-foreground">{uploadFile.name}</p>
                      <p className="text-sm text-slate-600">{(uploadFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-foreground mb-2">
                        Drop report file here or click to browse
                      </p>
                      <p className="text-sm text-slate-600">
                        Supports PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Report Status</Label>
                  <Select value={reportStatus} onValueChange={setReportStatus}>
                    <SelectTrigger id="status" data-testid="report-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any notes or instructions for the patient..."
                  rows={3}
                  data-testid="remarks-input"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || !uploadFile}
                className="w-full bg-primary hover:bg-primary-hover text-white"
                size="lg"
                data-testid="upload-report-button"
              >
                {uploading ? 'Uploading...' : 'Upload Report'}
              </Button>
            </>
          )}
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
          All Reports ({allReports.length})
        </h2>

        {allReports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No reports uploaded yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {allReports.map((report) => (
              <Card key={report.id} className="p-6" data-testid={`report-item-${report.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {report.test_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'ready' ? 'bg-green-100 text-green-700' :
                        report.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-600">
                      <p><span className="font-semibold">Patient:</span> {report.patient_name}</p>
                      <p><span className="font-semibold">Booking ID:</span> {report.booking_id}</p>
                      <p><span className="font-semibold">Report ID:</span> {report.report_id}</p>
                      <p><span className="font-semibold">Uploaded:</span> {new Date(report.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    {report.remarks && (
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-semibold">Remarks:</span> {report.remarks}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report.id, report.file_name)}
                      data-testid={`download-report-${report.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-report-${report.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;
