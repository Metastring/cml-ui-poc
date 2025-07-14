// utils/polygonBaseApi.ts

const BASE_URL = ''

export const GetPolygonBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`).then((res) => res.json())


export const PostPolygonBaseApiHandler = (url: string, body: unknown) =>
  fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json())


export const PutPolygonBaseApiHandler = (url: string, body: unknown) =>
  fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => res.json())


export const DeletePolygonBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`, {
    method: 'DELETE',
  }).then((res) => res.json())
