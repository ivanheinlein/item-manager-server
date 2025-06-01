import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000/api';

export const options = {
  vus: 5, // 5 користувачів одночасно
  duration: '10s', // протягом 10 секунд
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
    'token is present': (r) => JSON.parse(r.body).data?.token !== undefined,
  });

  const token = JSON.parse(loginRes.body).data?.token;

  if (!token) {
    console.error('Token not received');
    return;
  }

  sleep(1); // Пауза між логіном і наступним запитом

  // 2. Отримання списку категорій
  const categoryHeaders = {
    'Authorization': `Bearer ${token}`,
  };

  const categoryRes = http.get(`${BASE_URL}/category`, { headers: categoryHeaders });

  check(categoryRes, {
    'category fetch successful': (r) => r.status === 200,
    'categories present': (r) => JSON.parse(r.body).data?.categories?.length >= 0,
  });

  sleep(1); // Пауза перед завершенням сценарію
}
