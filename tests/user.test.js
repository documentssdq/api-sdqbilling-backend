const request = require('supertest');
const app = require('../src/app');
const EmailTemplate = require('../src/modules/admin/emailtemplate/models/emailTemplateModel');

describe('User Module', () => {
  it('should get all users', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
  });

  it('should require From Name and From Email when creating an email template', () => {
    const template = new EmailTemplate({
      title: 'Welcome Email',
      unique_code: 'welcome-email',
      subject: 'Welcome',
      from_email: '',
      from_name: '',
      message: 'Hello there',
    });

    const error = template.validateSync();

    expect(error.errors.from_email.message).toBe('From Email is required');
    expect(error.errors.from_name.message).toBe('From Name is required');
  });
});