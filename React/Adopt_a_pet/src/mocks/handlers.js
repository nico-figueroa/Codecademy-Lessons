import { http, HttpResponse } from 'msw';
import types from './data/types.json';
import animals from './data/animals.json';
import details from './data/details.json';

export const handlers = [
  http.get('/types', () => {
    return HttpResponse.json(types);
  }),
  http.get('/animals', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? '';
    const query = url.searchParams.get('query') ?? '';
    let response = animals.animals;

    if (type !== '') {
      response = response.filter(
        (animal) => animal.type.toLowerCase() === type.toLowerCase()
      );
    }
    if (query !== '') {
      response = response.filter(
        (animal) =>
          animal.contact.address.state
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          animal.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    return HttpResponse.json(response);
  }),
  http.get('/animals/:id', ({ params }) => {
    const id = String(params.id);
    let response = details[id];

    if (!response) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(response);
  })
];
