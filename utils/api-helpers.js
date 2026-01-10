import fs from 'fs';

export async function getAccessToken(request, BASE_URL, SESSION_COOKIE) {
  const { accessToken } = await (await request.get(`${BASE_URL}/api/auth/session`, { headers: { Cookie: SESSION_COOKIE } })).json();
  return accessToken;
}

export async function createProject(request, BASE_API_URL, accessToken, name, description, has_samples = false) {
  const projectPayload = { name, description, has_samples };
  return await request.post(`${BASE_API_URL}/dataset/projects/add`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    form: projectPayload
  });
}

export async function uploadFile(request, BASE_API_URL, accessToken, projectId, filePath, title, description, column_header_row = 1) {
  return await request.post(`${BASE_API_URL}/dataset/datasets/upload/${projectId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    multipart: {
      title,
      file: fs.createReadStream(filePath),
      description,
      column_header_row
    }
  });
}