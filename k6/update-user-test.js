import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 1,
  duration: '10s',
};

export default function () {
  // 1. Авторизація
  const loginPayload = JSON.stringify({
    email: 'email1@email.com',
    password: '111111',
  });

  const loginHeaders = { 'Content-Type': 'application/json' };

  const loginRes = http.post('http://localhost:3000/api/user/login', loginPayload, { headers: loginHeaders });

  check(loginRes, {
    'login successful': (r) => r.status === 201,
    'token received': (r) => JSON.parse(r.body).data?.token !== undefined,
  });

  const token = JSON.parse(loginRes.body).data?.token;
  if (!token) {
    console.error('No token received');
    return;
  }

  sleep(1);

  // 2. Оновлення профілю
  const boundary = '----WebKitFormBoundary' + uuidv4();

  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="name"\r\n`,
    `UpdatedName`,

    `--${boundary}`,
    `Content-Disposition: form-data; name="surname"\r\n`,
    `UpdatedSurname`,

    `--${boundary}`,
    `Content-Disposition: form-data; name="email"\r\n`,
    `email1@email.com`,

    `--${boundary}--`,
  ].join('\r\n');

  const updateHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  };

  const updateRes = http.post('http://localhost:3000/api/user/', formData, {
    headers: updateHeaders,
  });

  check(updateRes, {
    'profile updated': (r) => r.status === 200,
    'response contains new name': (r) => r.body.includes('UpdatedName'),
  });

  sleep(1);
}
