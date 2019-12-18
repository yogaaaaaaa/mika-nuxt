export default [
  {
    key: "name",
    caption: "Name",
    fieldType: "text",
    rules: "required|max:50",
    type: "text",
    value: ""
  },
  {
    key: "username",
    caption: "Username",
    fieldType: "text",
    rules: "required|max:50",
    type: "text",
    value: ""
  },
  {
    key: "email",
    caption: "Email",
    fieldType: "text",
    rules: "required|email",
    type: "text",
    value: ""
  },
  {
    key: "phoneNumber",
    caption: "Phone Number",
    fieldType: "text",
    rules: "",
    type: "number",
    value: ""
  },
  {
    key: "acquirerCompanyId",
    caption: "Acquirer Company",
    fieldType: "text",
    rules: "",
    type: "text",
    value: "",
    readonly: true
  },
  {
    key: "description",
    caption: "Description",
    fieldType: "textarea",
    rules: "max:250",
    type: "textarea",
    value: ""
  }
];
