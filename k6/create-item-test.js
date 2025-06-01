import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const imageBin = open('./test-image.jpg', 'b'); 

const BASE_URL = 'http://localhost:3000/api';

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

  const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, { headers: loginHeaders });

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

  // 2. Multipart FormData
  const boundary = '----WebKitFormBoundary' + uuidv4();

  const formDataParts = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="name"\r\n`,
    `Test Item Name`,

    `--${boundary}`,
    `Content-Disposition: form-data; name="description"\r\n`,
    `Item created from k6`,

    `--${boundary}`,
    `Content-Disposition: form-data; name="image"; filename="test-image.jpg"`,
    `Content-Type: image/jpeg\r\n`,
    imageBin,

    `--${boundary}--`,
  ];

  const body = formDataParts.join('\r\n');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  };

  const res = http.post(`${BASE_URL}/item`, body, { headers });

  check(res, {
    'item created': (r) => r.status === 201 || r.status === 200,
    'item name in response': (r) => r.body.includes('Test Item Name'),
  });

  sleep(1);
}
