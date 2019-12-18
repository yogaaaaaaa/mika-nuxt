export default [
  {
    key: 'name',
    caption: 'Name',
    fieldType: 'text',
    rules: 'required|max:50',
    type: 'text',
    value: '',
  },
  {
    key: 'username',
    caption: 'Username',
    fieldType: 'text',
    rules: 'required|max:50',
    type: 'text',
    value: '',
  },
  {
    key: 'email',
    caption: 'Email',
    fieldType: 'text',
    rules: 'required|email',
    type: 'text',
    value: '',
  },
  {
    key: 'description',
    caption: 'Description',
    fieldType: 'textarea',
    rules: 'max:250',
    type: 'textarea',
    value: '',
  },
]
