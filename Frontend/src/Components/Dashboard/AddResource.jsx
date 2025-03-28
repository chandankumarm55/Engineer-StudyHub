import React, { useState, useEffect } from "react";
import { Button, Form, Checkbox, Select, Upload, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from 'axios';

const AddResource = ({ onClose, onSubmit, initialValues }) => {
  const [university, setUniversity] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [pyqFile, setPyqFile] = useState(null);
  const [noteFile, setNoteFile] = useState(null);
  const [title, setTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDes, setVideoDes] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const { Option } = Select;
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      // Set the form fields with initial values
      form.setFieldsValue({
        university: initialValues.university,
        branch: initialValues.branch,
        subject: initialValues.subject,
        semester: initialValues.semester,
        pyqtitle: initialValues.pyq?.title || "",
        notestitle: initialValues.note?.title || "",
        videoTitle: initialValues.video?.title || "",
        videoDescription: initialValues.video?.description || "",
        videoLink: initialValues.video?.videoUrl || "",
        resourceType: getResourceTypes(initialValues)
      });

      // Set states
      setUniversity(initialValues.university);
      setBranch(initialValues.branch);
      setSubject(initialValues.subject);
      setSemester(initialValues.semester);
      setTitle(initialValues.pyq?.title || "");
      setNoteTitle(initialValues.note?.title || "");
      setVideoTitle(initialValues.video?.title || "");
      setVideoDes(initialValues.video?.description || "");
      setVideoLink(initialValues.video?.videoUrl || "");
      setSelectedOptions(getResourceTypes(initialValues));

      // For files, we can't recover the actual file, but we can show a preview if editing
      if (initialValues.video?.imageUrl) {
        setThumbnailPreview(`http://localhost:5000${initialValues.video.imageUrl}`);
      }
    } else {
      // Reset form fields for adding a new resource
      form.resetFields();
      resetStates();
    }
  }, [initialValues, form]);

  const getResourceTypes = (data) => {
    const types = [];
    if (data.pyq) types.push("PYQ");
    if (data.note) types.push("Notes");
    if (data.video) types.push("Video");
    return types;
  };

  const resetStates = () => {
    setUniversity("");
    setBranch("");
    setSubject("");
    setSemester("");
    setPyqFile(null);
    setNoteFile(null);
    setTitle("");
    setNoteTitle("");
    setVideoTitle("");
    setVideoDes("");
    setVideoLink("");
    setSelectedOptions([]);
    setThumbnailPreview(null);
    setFileList([]);
  };

  const onCheckboxChange = (checkedValues) => {
    setSelectedOptions(checkedValues);
  };

  const handleFileChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file && file.type === "application/pdf") {
      setPyqFile(file);
      setFileList(info.fileList);
    } else {
      message.error("Please select a valid PDF file.");
      setFileList([]);
    }
  };

  const handleFileNoteChanges = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file && file.type === "application/pdf") {
      setNoteFile(file);
    } else {
      message.error("Please select a valid PDF file.");
    }
  };

  const handleThumbnailChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setThumbnailPreview(imageURL);
      // Store the actual file object for upload
      setThumbnailPreview(file);
    } else {
      message.error("Please upload a valid image file for the thumbnail.");
    }
  };

  const validateCheckboxGroup = (rule, value) => {
    if (!value || value.length < 1) {
      return Promise.reject(
        new Error("Please select at least one resource type!")
      );
    }
    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Create a new FormData object
      const formData = new FormData();

      // Append all the form data fields
      formData.append('university', university);
      formData.append('branch', branch);
      formData.append('semester', semester);
      formData.append('subject', subject);

      // Only append if resource type is selected
      if (selectedOptions.includes("PYQ")) {
        formData.append('pyqTitle', title);
        if (pyqFile) formData.append('pyqFile', pyqFile);
      }

      if (selectedOptions.includes("Notes")) {
        formData.append('noteTitle', noteTitle);
        if (noteFile) formData.append('noteFile', noteFile);
      }

      if (selectedOptions.includes("Video")) {
        formData.append('videoTitle', videoTitle);
        formData.append('videoDescription', videoDes);
        formData.append('videoUrl', videoLink);
        if (thumbnailPreview instanceof File) {
          formData.append('videoImage', thumbnailPreview);
        }
      }

      let response;

      if (initialValues && initialValues._id) {
        // Update existing resource
        response = await axios.put(
          `http://localhost:5000/api/v1/resource/${initialValues._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Create new resource
        response = await axios.post(
          'http://localhost:5000/api/v1/resource',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      // Handle success response
      if (response.status === 200 || response.status === 201) {
        message.success(`Resource ${initialValues ? 'updated' : 'added'} successfully!`);
        form.resetFields(); // Clear input fields after submission
        resetStates();
        onSubmit(response.data); // Pass the response data to parent component
      }
    } catch (error) {
      console.error("Error submitting the form", error);
      message.error(`Failed to ${initialValues ? 'update' : 'add'} resource. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-container" style={ { backgroundColor: "#f5f5f5", borderRadius: "6px" } }>
      <h1>{ initialValues ? "Edit Resource" : "Add Resources" }</h1>
      <div className="add-content">
        <Form onFinish={ handleSubmit } form={ form } layout="vertical">
          {/* University */ }
          <Form.Item
            label="University"
            name="university"
            rules={ [
              { required: true, message: "Please select the University!" },
            ] }
          >
            <Select
              placeholder="Select University"
              value={ university }
              onChange={ setUniversity }
            >
              <Option value="RGPV">
                Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)
              </Option>
              <Option value="DAVV">Devi Ahilya Vishwavidyalaya (DAVV)</Option>
              <Option value="IITD">
                Indian Institute of Technology Delhi (IITD)
              </Option>
              <Option value="IITB">
                Indian Institute of Technology Bombay (IITB)
              </Option>
              <Option value="IIMB">
                Indian Institute of Management Bangalore (IIMB)
              </Option>
              <Option value="DU">University of Delhi (DU)</Option>
              <Option value="JNU">Jawaharlal Nehru University (JNU)</Option>
              <Option value="RTMNU">Rashtrasant Tukdoji Maharaj University (RTMNU)</Option>
              <Option value="XYZ">XYZ University</Option>
            </Select>
          </Form.Item>

          {/* Branch */ }
          <Form.Item
            label="Branch"
            name="branch"
            rules={ [{ required: true, message: "Please select the branch!" }] }
          >
            <Select
              placeholder="Select Branch"
              value={ branch }
              onChange={ setBranch }
            >
              <Option value="EC">Electronics and Communication</Option>
              <Option value="CS">Computer Science</Option>
              <Option value="ME">Mechanical Engineering</Option>
              <Option value="CE">Civil Engineering</Option>
              <Option value="IT">Information Technology</Option>
              <Option value="EE">Electrical Engineering</Option>
              <Option value="BT">Biotechnology</Option>
              <Option value="AE">Aerospace Engineering</Option>
            </Select>
          </Form.Item>

          {/* Semester */ }
          <Form.Item
            label="Semester"
            name="semester"
            rules={ [{ required: true, message: "Please select the semester!" }] }
          >
            <Select
              placeholder="Select Semester"
              value={ semester }
              onChange={ setSemester }
            >
              <Option value="1st Semester">1st Semester</Option>
              <Option value="2nd Semester">2nd Semester</Option>
              <Option value="3rd Semester">3rd Semester</Option>
              <Option value="4th Semester">4th Semester</Option>
              <Option value="5th Semester">5th Semester</Option>
              <Option value="6th Semester">6th Semester</Option>
              <Option value="7th Semester">7th Semester</Option>
              <Option value="8th Semester">8th Semester</Option>
            </Select>
          </Form.Item>

          {/* Subject */ }
          <Form.Item
            label="Subject"
            name="subject"
            rules={ [{ required: true, message: "Please select the subject!" }] }
          >
            <Select
              placeholder="Select Subject"
              value={ subject }
              onChange={ setSubject }
            >
              <Option value="Data Structures">Data Structures</Option>
              <Option value="Algorithms">Algorithms</Option>
              <Option value="Operating Systems">Operating Systems</Option>
              <Option value="Database Systems">Database Systems</Option>
              <Option value="Computer Networks">Computer Networks</Option>
              <Option value="Software Engineering">Software Engineering</Option>
              <Option value="Machine Learning">Machine Learning</Option>
              <Option value="Artificial Intelligence">
                Artificial Intelligence
              </Option>
            </Select>
          </Form.Item>

          {/* Resource Type Checkbox */ }
          <Form.Item
            label="Resource Type"
            name="resourceType"
            rules={ [{ validator: validateCheckboxGroup }] }
          >
            <Checkbox.Group onChange={ onCheckboxChange }>
              <Checkbox value="PYQ">PYQ</Checkbox>
              <Checkbox value="Notes">Notes</Checkbox>
              <Checkbox value="Video">Video</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          {/* PYQ */ }
          { selectedOptions.includes("PYQ") && (
            <>
              <Form.Item
                label="PYQ (Previous Year Questions) Title"
                name="pyqtitle"
                rules={ [
                  { required: true, message: "Please provide the PYQ Title!" },
                ] }
              >
                <Input
                  placeholder="Enter PYQ Title"
                  value={ title }
                  onChange={ (e) => setTitle(e.target.value) }
                />
              </Form.Item>
              <Form.Item
                label="Upload PYQ PDF"
                name="pyqFile"
                rules={ [
                  { required: !initialValues?.pyq, message: "Please upload the PYQ PDF!" },
                ] }
              >
                <Upload
                  onChange={ handleFileChange }
                  beforeUpload={ () => false }
                  accept="application/pdf"
                  fileList={ fileList }
                >
                  <Button icon={ <UploadOutlined /> }>Click to Upload</Button>
                </Upload>
                { initialValues?.pyq?.pdfUrl && !pyqFile && (
                  <div style={ { marginTop: 8 } }>
                    Current file: <a href={ `http://localhost:5000${initialValues.pyq.pdfUrl}` } target="_blank" rel="noopener noreferrer">View existing file</a>
                  </div>
                ) }
              </Form.Item>
            </>
          ) }

          {/* Notes */ }
          { selectedOptions.includes("Notes") && (
            <>
              <Form.Item
                label="Notes Title"
                name="notestitle"
                rules={ [
                  {
                    required: true,
                    message: "Please provide the Notes Title!",
                  },
                ] }
              >
                <Input
                  placeholder="Enter Notes Title"
                  value={ noteTitle }
                  onChange={ (e) => setNoteTitle(e.target.value) }
                />
              </Form.Item>
              <Form.Item
                label="Upload Notes PDF"
                name="noteFile"
                rules={ [
                  { required: !initialValues?.note, message: "Please upload the Notes PDF!" },
                ] }
              >
                <Upload
                  onChange={ handleFileNoteChanges }
                  beforeUpload={ () => false }
                  accept="application/pdf"
                >
                  <Button icon={ <UploadOutlined /> }>Click to Upload</Button>
                </Upload>
                { initialValues?.note?.pdfUrl && !noteFile && (
                  <div style={ { marginTop: 8 } }>
                    Current file: <a href={ `http://localhost:5000${initialValues.note.pdfUrl}` } target="_blank" rel="noopener noreferrer">View existing file</a>
                  </div>
                ) }
              </Form.Item>
            </>
          ) }

          {/* Video */ }
          { selectedOptions.includes("Video") && (
            <>
              <Form.Item
                label="Video Lecture Title"
                name="videoTitle"
                rules={ [
                  {
                    required: true,
                    message: "Please provide the Video Title!",
                  },
                ] }
              >
                <Input
                  placeholder="Enter Video Title"
                  value={ videoTitle }
                  onChange={ (e) => setVideoTitle(e.target.value) }
                />
              </Form.Item>
              <Form.Item
                label="Video Description"
                name="videoDescription"
                rules={ [
                  {
                    required: true,
                    message: "Please provide a description for the video!",
                  },
                ] }
              >
                <Input.TextArea
                  placeholder="Enter Video Description"
                  value={ videoDes }
                  onChange={ (e) => setVideoDes(e.target.value) }
                />
              </Form.Item>
              <Form.Item
                label="Video Link"
                name="videoLink"
                rules={ [
                  { required: true, message: "Please provide the Video Link!" },
                ] }
              >
                <Input
                  placeholder="Enter Video Link"
                  value={ videoLink }
                  onChange={ (e) => setVideoLink(e.target.value) }
                />
              </Form.Item>
              <Form.Item label="Thumbnail Image" name="thumbnail">
                <Upload
                  beforeUpload={ () => false }
                  onChange={ handleThumbnailChange }
                  accept="image/*"
                >
                  <Button icon={ <UploadOutlined /> }>Upload Thumbnail</Button>
                </Upload>
                { thumbnailPreview && typeof thumbnailPreview === 'string' && (
                  <img
                    src={ thumbnailPreview }
                    alt="Thumbnail"
                    style={ { width: "100px", height: "100px", marginTop: "8px" } }
                  />
                ) }
                { initialValues?.video?.imageUrl && !thumbnailPreview && (
                  <img
                    src={ `http://localhost:5000${initialValues.video.imageUrl}` }
                    alt="Thumbnail"
                    style={ { width: "100px", height: "100px", marginTop: "8px" } }
                  />
                ) }
              </Form.Item>
            </>
          ) }

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={ {
                backgroundColor: "#553CDF",
                border: "none",
              } }
              loading={ loading }
            >
              { initialValues ? "Update Resource" : "Add Resource" }
            </Button>
            <Button
              onClick={ onClose }
              style={ { borderColor: "#553CDF", color: "#553CDF", marginLeft: "8px" } }
              disabled={ loading }
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddResource;