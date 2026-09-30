from flask import Flask, request, jsonify
import requests
import re

app = Flask(__name__)

OPENALEX_URL = "https://api.openalex.org/works"

def invert_abstract(inverted_index):
    if not inverted_index:
        return None
    position_word_pairs = []
    for word, positions in inverted_index.items():
        for pos in positions:
            position_word_pairs.append((pos, word))
    position_word_pairs.sort(key=lambda x: x[0])
    words = [word for pos, word in position_word_pairs]
    return ' '.join(words)

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    use_scihub = request.args.get('scihub', 'true').lower() == 'true'
    if not query:
        return jsonify({'error': 'Query parameter q is required'}), 400
    params = {'search': query, 'per-page': 10}
    try:
        resp = requests.get(OPENALEX_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        return jsonify({'error': f'Failed to fetch from OpenAlex: {str(e)}'}), 502
    results = []
    for work in data.get('results', []):
        title = work.get('display_name')
        authorships = work.get('authorships', [])
        author_names = [auth['author']['display_name'] for auth in authorships if auth.get('author') and auth['author'].get('display_name')]
        authors = ', '.join(author_names) if author_names else None
        host_venue = work.get('host_venue')
        venue = host_venue.get('display_name') if host_venue else None
        doi = work.get('doi')
        abstract_inverted = work.get('abstract_inverted_index')
        abstract = invert_abstract(abstract_inverted) if abstract_inverted else None
        result = {
            'title': title,
            'authors': authors,
            'venue': venue,
            'doi': doi,
            'abstract': abstract,
            'source': 'openalex'
        }
        if use_scihub and doi:
            result['scihub_url'] = f'https://sci-hub.se/{doi}'
        results.append(result)
    return jsonify({'query': query, 'results': results, 'total': len(results)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
