import {URL} from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';
import {check, sleep} from 'k6';
import {Rate} from 'k6/metrics';
import {headerWithAuthorizationAndToken, login} from '../login.js';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    {duration: '1m', target: 1}, // Stage: ramp up
    {duration: '2m', target: 8}, // Stage: ramp up
    {duration: '3m', target: 16}, // Stage: stay
    {duration: '2m', target: 8}, // Stage: ramp down
    {duration: '10s', target: 0}, // Stage: ramp down
  ],
  thresholds: {
    checks: ['rate>0.99'],
    http_req_duration: ['p(99)<200'],
  },
};

export default function () {
  getAllStations();
  getPath();
  addFavorite();
}

const BASE_URL_FOR_ASG = 'https://www.orgojy.ga';
// const BASE_URL_FOR_OPTIMIZATION = 'https://orgojy.ga';
const MY_EMAIL = 'orgojy@gmail.com';
const MY_PASSWORD = '1234';

function getAllStations() {
  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let stationsRes = http.get(`${BASE_URL_FOR_ASG}/stations`, params);

  const success = check(stationsRes, {
    'Get Stations ': (res) => res.json().length >= 615,
  });
  errorRate.add(!success);
  sleep(1);
}

function getPath() {
  let headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const url = new URL(`${BASE_URL_FOR_ASG}/paths`);
  url.searchParams.append('source', 1);
  url.searchParams.append('target', 15);

  const response = http.get(url.toString(), headers);

  const success = check(response, {
    'Get a path ': (res) => res.json().distance === 27,
  });
  errorRate.add(!success);
  sleep(1);
}

function addFavorite() {
  const auth_header = headerWithAuthorizationAndToken(
      login(MY_EMAIL, MY_PASSWORD));

  const payload = JSON.stringify({
    source: 1,
    target: 15,
  });

  const url = new URL(`${BASE_URL_FOR_ASG}/favorites`);
  const response = http.post(url.toString(), payload, auth_header);

  const success = check(response, {
    'Add a favorite ': (res) => res.status === 201,
  });
  errorRate.add(!success);
  sleep(1);
}
