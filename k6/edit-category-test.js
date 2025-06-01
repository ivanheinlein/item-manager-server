import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = 'http://localhost:3000/api';

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  // 1. Авторизація
  const loginPayload = JSON.stringify({
    email: 'email1@email.com',
    password: '111111',
  });

  const loginHeaders = { 'Content-Type': 'application/json' };

  const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, { headers: loginHeaders });

  check(loginRes, {
    'login successful': (r) => r.status === 201,
    'token received': (r) => JSON.parse(r.body).data?.token !== undefined,
  });

  const token = JSON.parse(loginRes.body).data?.token;

  if (!token) {
    console.error('Token not received');
    return;
  }

  sleep(1);

  // 2. Дані для редагування
  const categoryId = 11;

  const boundary = '----WebKitFormBoundary' + uuidv4();
  const formData = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="name"\r\n\r\n` +
    `Updated Category Name\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="color"\r\n\r\n` +
    `#ff00ff\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="description"\r\n\r\n` +
    `Updated description of the category\r\n` +
    `--${boundary}--\r\n`;

  const editHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  };

  const editRes = http.put(`${BASE_URL}/category/${categoryId}`, formData, {
    headers: editHeaders,
  });

  check(editRes, {
    'category updated': (r) => r.status === 200,
    'response contains updated category': (r) => r.body.includes('Updated Category Name'),
  });

  sleep(1);
}
