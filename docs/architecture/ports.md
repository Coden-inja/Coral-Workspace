# Port Allocation

| Service         | Port | Protocol | Access      |
|-----------------|------|----------|-------------|
| frontend        | 3000 | HTTP     | Internal    |
| backend         | 8000 | HTTP     | Internal    |
| semantic-engine | 8001 | HTTP     | Internal    |
| postgres        | 5432 | TCP      | Internal    |
| redis           | 6379 | TCP      | Internal    |
| coral           | 5555 | TCP/HTTP | Internal    |
| nginx           | 80   | HTTP     | External    |
| nginx           | 443  | HTTPS    | External    |

## Notes

- Only nginx ports (80, 443) are exposed to the host network
- All service ports are internal to the Docker network
- Port mapping in docker-compose is for local development only
