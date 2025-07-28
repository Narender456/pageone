"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Switch } from "../ui/switch"
import PropTypes from "prop-types"
import * as XLSX from 'xlsx'

export function ExcelDialog({ open, onOpenChange, onSave, excelFile, title, loading, studies = [] }) {
  const [formData, setFormData] = useState({
    file: excelFile || null,
    excel_name: excelFile ? excelFile.name : "",
    selectedColumns: {},
    temporary: true,
    selectedStudies: [],
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudies, setFilteredStudies] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [excelData, setExcelData] = useState(null)
  const [excelSearchTerm, setExcelSearchTerm] = useState("")
  const [filteredExcelData, setFilteredExcelData] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileInput, setFileInput] = useState(null)

  useEffect(() => {
    if (excelFile) {
      setFormData({
        file: null, // Can't pre-populate file input
        selectedColumns: excelFile.selectedColumns || {},
        temporary: excelFile.temporary !== undefined ? excelFile.temporary : true,
        selectedStudies: excelFile.studies?.map((s) => s._id || s.id) || [],
      })
    } else {
      setFormData({
        file: null,
        selectedColumns: {},
        temporary: true,
        selectedStudies: [],
      })
    }
    setErrors({})
    setSearchTerm("")
    setPreviewData(null)
    setExcelData(null)
    setExcelSearchTerm("")
    setFilteredExcelData([])
  }, [excelFile, open])

  useEffect(() => {
    console.log("ALL STUDIES:", studies)
    if (searchTerm.trim() === "") {
      setFilteredStudies(studies)
    } else {
      const filtered = studies.filter((study) =>
        study.study_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.protocol_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.study_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudies(filtered)
    }
  }, [searchTerm, studies])

  // Filter Excel data based on search term
  useEffect(() => {
    if (!excelData) {
      setFilteredExcelData([])
      return
    }

    if (excelSearchTerm.trim() === "") {
      setFilteredExcelData(excelData.data)
    } else {
      const filtered = excelData.data.filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(excelSearchTerm.toLowerCase())
        )
      )
      setFilteredExcelData(filtered)
    }
  }, [excelSearchTerm, excelData])

  const validateForm = () => {
    const newErrors = {}
    
    if (!excelFile && !formData.file) {
      newErrors.file = "Excel file is required"
    }

    if (formData.file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ]
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Only Excel files (.xlsx, .xls) are allowed"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    onSave(formData)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ 
        ...formData, 
        file,
        excel_name: file.name  // Update name when file changes
      })
      setFileInput(file)
      // Clear previous excel data when new file is selected
      setExcelData(null)
      setExcelSearchTerm("")
    }
  }

const handleUploadClick = async () => {
  if (!fileInput) {
    setErrors({ ...errors, file: "Please select a file first" });
    return;
  }

  setIsProcessing(true);
  try {
    const formDataUpload = new FormData();
    formDataUpload.append("file", fileInput);
    formDataUpload.append("temporary", true);

    const response = await fetch("http://localhost:5000/api/excel/files/upload", {
      method: "POST",
      body: formDataUpload,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Upload failed");
    }

    console.log("📁 Uploaded file:", result);

    // ✅ Save fileId to formData
    setFormData((prev) => ({
      ...prev,
      fileId: result.fileId, // ✅ set fileId here
      excel_name: result.file?.fileName || prev.excel_name,
    }));

    // ✅ Trigger frontend parsing (XLSX read) afterward (optional)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) throw new Error("The Excel file appears to be empty");

        const headers = jsonData[0];
        const rows = jsonData.slice(1).map((row, index) => {
          const rowObj = { _rowIndex: index + 2 };
          headers.forEach((header, colIndex) => {
            rowObj[header] = row[colIndex] || "";
          });
          return rowObj;
        });

        const processedData = {
          headers,
          data: rows,
          totalRows: rows.length,
          fileName: fileInput.name,
          sheetName,
        };

        setExcelData(processedData);
        setFilteredExcelData(rows);

        const initialSelectedColumns = {};
        headers.forEach((header) => {
          initialSelectedColumns[header] = header;
        });

        setFormData((prev) => ({
          ...prev,
          selectedColumns: initialSelectedColumns,
        }));

        setErrors({});
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setErrors({ ...errors, file: `Error reading Excel file: ${error.message}` });
      }
    };

    reader.onerror = () => {
      setErrors({ ...errors, file: "Error reading the file" });
    };

    reader.readAsArrayBuffer(fileInput);
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    setErrors({ ...errors, file: error.message });
  } finally {
    setIsProcessing(false);
  }
};


  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      if (allowedTypes.includes(file.type)) {
        setFormData({ ...formData, file })
        setFileInput(file)
        // Clear previous excel data when new file is dropped
        setExcelData(null)
        setExcelSearchTerm("")
      } else {
        setErrors({ ...errors, file: "Only Excel files (.xlsx, .xls) are allowed" })
      }
    }
  }

  const handleSelectAll = () => {
    if (formData.selectedStudies.length === filteredStudies.length) {
      setFormData({ ...formData, selectedStudies: [] })
    } else {
      const allStudyIds = filteredStudies.map((study) => study._id || study.id)
      setFormData({ ...formData, selectedStudies: allStudyIds })
    }
  }

  const handleStudySelect = (studyId) => {
    const updatedSelection = formData.selectedStudies.includes(studyId)
      ? formData.selectedStudies.filter((id) => id !== studyId)
      : [...formData.selectedStudies, studyId]

    setFormData({ ...formData, selectedStudies: updatedSelection })
  }

  const handleColumnSelection = (columnName, isSelected) => {
    const updatedColumns = { ...formData.selectedColumns }
    if (isSelected) {
      updatedColumns[columnName] = columnName
    } else {
      delete updatedColumns[columnName]
    }
    setFormData({ ...formData, selectedColumns: updatedColumns })
  }

  const handleSelectAllColumns = () => {
    if (!excelData) return
    
    const allSelected = excelData.headers.every(header => 
      formData.selectedColumns[header] !== undefined
    )
    
    if (allSelected) {
      // Deselect all
      setFormData({ ...formData, selectedColumns: {} })
    } else {
      // Select all
      const allColumns = {}
      excelData.headers.forEach(header => {
        allColumns[header] = header
      })
      setFormData({ ...formData, selectedColumns: allColumns })
    }
  }

  const isAllSelected = filteredStudies.length > 0 &&
    formData.selectedStudies.length === filteredStudies.length

  const isAllColumnsSelected = excelData && 
    excelData.headers.every(header => formData.selectedColumns[header] !== undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {excelFile ? "Update the Excel file configuration." : "Upload a new Excel file and configure its settings."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            
            {/* File Upload Section */}
            {!excelFile && (
              <div className="grid gap-2">
                <Label htmlFor="file">Excel File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : errors.file 
                        ? 'border-destructive' 
                        : 'border-muted-foreground/25'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {formData.file ? (
                          <span className="text-foreground font-medium">{formData.file.name}</span>
                        ) : (
                          <>
                            <span>Drag and drop your Excel file here, or </span>
                            <span className="text-primary underline">click to browse</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Supported formats: .xlsx, .xls
                      </div>
                    </div>
                  </Label>
                </div>
                
                {/* Upload Button */}
                {fileInput && (
                  <div className="flex mt-2">
                    <Button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isProcessing}
                      className="px-6 h-10 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isProcessing ? "Processing..." : "Upload"}
                    </Button>
                  </div>
                )}
                
                {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
              </div>
            )}

            {/* Excel Data Display */}
            {excelData && (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Excel Data Preview</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllColumns}
                      className="text-xs"
                    >
                      {isAllColumnsSelected ? "Deselect All Columns" : "Select All Columns"}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {excelData.totalRows} rows • {excelData.headers.length} columns
                    </div>
                  </div>
                </div>

                {/* Column Selection Info */}
                {Object.keys(formData.selectedColumns).length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(formData.selectedColumns).length} of {excelData.headers.length} columns selected
                  </div>
                )}
                
                {/* Search Excel Data */}
                <div className="grid gap-2">
                  <Label htmlFor="searchExcelData">Search Excel Data</Label>
                  <Input
                    id="searchExcelData"
                    value={excelSearchTerm}
                    onChange={(e) => setExcelSearchTerm(e.target.value)}
                    placeholder="Search through all data..."
                  />
                </div>

                {/* Excel Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium border-r">Row</th>
                          {excelData.headers.map((header, index) => (
                            <th key={index} className="text-left p-3 text-sm font-medium border-r">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={formData.selectedColumns[header] !== undefined}
                                  onCheckedChange={(checked) => handleColumnSelection(header, checked)}
                                />
                                <span className="font-medium">{header}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExcelData.length > 0 ? (
                          filteredExcelData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-muted/20 border-b">
                              <td className="p-3 text-sm border-r font-medium text-muted-foreground">
                                {row._rowIndex}
                              </td>
                              {excelData.headers.map((header, colIndex) => (
                                <td 
                                  key={colIndex} 
                                  className={`p-3 text-sm border-r ${
                                    formData.selectedColumns[header] ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  {row[header] || '—'}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={excelData.headers.length + 1} className="p-6 text-center text-muted-foreground">
                              {excelSearchTerm ? "No data found matching your search" : "No data available"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {excelSearchTerm && (
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredExcelData.length} of {excelData.totalRows} rows
                  </div>
                )}
              </div>
            )}

            {/* Column Selection (if editing existing file) */}
            {excelFile && previewData && (
              <div className="grid gap-2">
                <Label>Select Columns to Process</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {previewData.columns?.map((column) => (
                      <div key={column} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.selectedColumns[column] !== undefined}
                          onCheckedChange={(checked) => handleColumnSelection(column, checked)}
                        />
                        <Label className="text-sm">{column}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Study Search */}
            <div className="grid gap-2">
              <Label htmlFor="searchStudies">Search Studies</Label>
              <Input
                id="searchStudies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by study name, protocol number, or study title"
              />
            </div>

            {/* Study Selection */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Assign to Studies</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredStudies.length === 0}
                >
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="border rounded-md max-h-60 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2 p-3 border-b bg-muted/30 font-medium text-sm">
                  <div>Select</div>
                  <div>Study Name</div>
                  <div>Protocol Number</div>
                  <div>Study Title</div>
                </div>

                {filteredStudies.length > 0 ? (
                  filteredStudies.map((study) => (
                    <div key={study._id || study.id} className="grid grid-cols-4 gap-2 p-3 border-b hover:bg-muted/20">
                      <div className="flex items-center">
                        <Checkbox
                          checked={formData.selectedStudies.includes(study._id || study.id)}
                          onCheckedChange={() => handleStudySelect(study._id || study.id)}
                        />
                      </div>
                      <div className="text-sm">{study.study_name || "N/A"}</div>
                      <div className="text-sm">{study.protocol_number || "N/A"}</div>
                      <div className="text-sm">{study.study_title || "N/A"}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    {searchTerm ? "No studies found matching your search" : "No studies available"}
                  </div>
                )}
              </div>

              {formData.selectedStudies.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.selectedStudies.length} study(ies) selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : excelFile ? "Update Excel File" : "Upload Excel File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

ExcelDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  excelFile: PropTypes.shape({
    selectedColumns: PropTypes.object,
    temporary: PropTypes.bool,
    studies: PropTypes.array,
  }),
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  studies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      study_name: PropTypes.string,
      protocol_number: PropTypes.string,
      study_title: PropTypes.string,
    })
  ),
}