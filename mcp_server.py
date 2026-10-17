#!/usr/bin/env python3
"""
GitHub MCP Server - Model Context Protocol Implementation
Funciona com Claude Desktop e outras aplicações MCP-compatíveis
"""

import json
import sys
from typing import Any, Dict, List, Optional
import httpx

class GitHubMCPServer:
    def __init__(self):
        self.github_token = None
        self.base_url = "https://api.github.com"
    
    def handle_initialize(self, params: dict) -> dict:
        """Initialize MCP connection"""
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "resources": {},
                "tools": {},
                "prompts": {}
            },
            "serverInfo": {
                "name": "github-mcp-server",
                "version": "1.0.0"
            }
        }
    
    def handle_resources_list(self) -> dict:
        """List available resources"""
        return {
            "resources": [
                {
                    "uri": "github://user/{username}",
                    "name": "GitHub User Profile",
                    "description": "Get GitHub user information and stats"
                },
                {
                    "uri": "github://repo/{owner}/{repo}",
                    "name": "GitHub Repository",
                    "description": "Get repository details and statistics"
                },
                {
                    "uri": "github://issues/{owner}/{repo}",
                    "name": "Repository Issues",
                    "description": "List issues in a repository"
                }
            ]
        }
    
    def handle_tools_list(self) -> dict:
        """List available tools"""
        return {
            "tools": [
                {
                    "name": "get_user",
                    "description": "Get informações sobre um usuário GitHub",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "username": {
                                "type": "string",
                                "description": "Nome de usuário GitHub"
                            }
                        },
                        "required": ["username"]
                    }
                },
                {
                    "name": "get_repo",
                    "description": "Obter informações de um repositório GitHub",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "owner": {
                                "type": "string",
                                "description": "Proprietário do repositório"
                            },
                            "repo": {
                                "type": "string",
                                "description": "Nome do repositório"
                            }
                        },
                        "required": ["owner", "repo"]
                    }
                },
                {
                    "name": "list_repos",
                    "description": "Listar repositórios de um usuário",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "username": {
                                "type": "string",
                                "description": "Nome de usuário GitHub"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Número máximo de repos (padrão: 10)"
                            }
                        },
                        "required": ["username"]
                    }
                },
                {
                    "name": "search_repos",
                    "description": "Buscar repositórios no GitHub",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Termo de busca"
                            },
                            "language": {
                                "type": "string",
                                "description": "Filtrar por linguagem (opcional)"
                            },
                            "sort": {
                                "type": "string",
                                "enum": ["stars", "forks", "updated"],
                                "description": "Ordenar por (padrão: stars)"
                            }
                        },
                        "required": ["query"]
                    }
                },
                {
                    "name": "get_issues",
                    "description": "Listar issues de um repositório",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "owner": {
                                "type": "string",
                                "description": "Proprietário do repositório"
                            },
                            "repo": {
                                "type": "string",
                                "description": "Nome do repositório"
                            },
                            "state": {
                                "type": "string",
                                "enum": ["open", "closed", "all"],
                                "description": "Estado das issues (padrão: open)"
                            }
                        },
                        "required": ["owner", "repo"]
                    }
                }
            ]
        }
    
    def call_tool(self, name: str, arguments: dict) -> dict:
        """Execute a tool"""
        try:
            if name == "get_user":
                return self._get_user(arguments["username"])
            elif name == "get_repo":
                return self._get_repo(arguments["owner"], arguments["repo"])
            elif name == "list_repos":
                return self._list_repos(arguments["username"], arguments.get("limit", 10))
            elif name == "search_repos":
                return self._search_repos(
                    arguments["query"],
                    arguments.get("language"),
                    arguments.get("sort", "stars")
                )
            elif name == "get_issues":
                return self._get_issues(
                    arguments["owner"],
                    arguments["repo"],
                    arguments.get("state", "open")
                )
            else:
                return {"error": f"Tool desconhecida: {name}"}
        except Exception as e:
            return {"error": f"Erro: {str(e)}"}
    
    def _get_user(self, username: str) -> dict:
        """Get user information"""
        try:
            response = httpx.get(f"{self.base_url}/users/{username}", timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "username": data.get("login"),
                    "name": data.get("name"),
                    "bio": data.get("bio"),
                    "company": data.get("company"),
                    "location": data.get("location"),
                    "followers": data.get("followers"),
                    "following": data.get("following"),
                    "public_repos": data.get("public_repos"),
                    "profile_url": data.get("html_url"),
                    "created_at": data.get("created_at")
                }
            else:
                return {"error": f"Usuário não encontrado", "status": response.status_code}
        except Exception as e:
            return {"error": str(e)}
    
    def _get_repo(self, owner: str, repo: str) -> dict:
        """Get repository information"""
        try:
            response = httpx.get(f"{self.base_url}/repos/{owner}/{repo}", timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "name": data.get("name"),
                    "owner": data.get("owner", {}).get("login"),
                    "description": data.get("description"),
                    "url": data.get("html_url"),
                    "stars": data.get("stargazers_count"),
                    "forks": data.get("forks_count"),
                    "watchers": data.get("watchers_count"),
                    "language": data.get("language"),
                    "open_issues": data.get("open_issues_count"),
                    "created_at": data.get("created_at"),
                    "updated_at": data.get("updated_at")
                }
            else:
                return {"error": f"Repositório não encontrado", "status": response.status_code}
        except Exception as e:
            return {"error": str(e)}
    
    def _list_repos(self, username: str, limit: int = 10) -> dict:
        """List user repositories"""
        try:
            response = httpx.get(
                f"{self.base_url}/users/{username}/repos",
                params={"per_page": min(limit, 100), "sort": "updated"},
                timeout=10.0
            )
            if response.status_code == 200:
                repos = response.json()
                return {
                    "success": True,
                    "total": len(repos),
                    "repos": [
                        {
                            "name": repo.get("name"),
                            "description": repo.get("description"),
                            "url": repo.get("html_url"),
                            "stars": repo.get("stargazers_count"),
                            "language": repo.get("language"),
                            "updated_at": repo.get("updated_at")
                        }
                        for repo in repos[:limit]
                    ]
                }
            else:
                return {"error": f"Falha ao listar repos", "status": response.status_code}
        except Exception as e:
            return {"error": str(e)}
    
    def _search_repos(self, query: str, language: Optional[str] = None, sort: str = "stars") -> dict:
        """Search repositories"""
        try:
            search_query = query
            if language:
                search_query += f" language:{language}"
            
            response = httpx.get(
                f"{self.base_url}/search/repositories",
                params={"q": search_query, "per_page": 10, "sort": sort},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "total_count": data.get("total_count"),
                    "repos": [
                        {
                            "name": repo.get("full_name"),
                            "description": repo.get("description"),
                            "url": repo.get("html_url"),
                            "stars": repo.get("stargazers_count"),
                            "language": repo.get("language"),
                            "updated_at": repo.get("updated_at")
                        }
                        for repo in data.get("items", [])
                    ]
                }
            else:
                return {"error": f"Busca falhou", "status": response.status_code}
        except Exception as e:
            return {"error": str(e)}
    
    def _get_issues(self, owner: str, repo: str, state: str = "open") -> dict:
        """Get repository issues"""
        try:
            response = httpx.get(
                f"{self.base_url}/repos/{owner}/{repo}/issues",
                params={"state": state, "per_page": 20},
                timeout=10.0
            )
            if response.status_code == 200:
                issues = response.json()
                return {
                    "success": True,
                    "total": len(issues),
                    "issues": [
                        {
                            "number": issue.get("number"),
                            "title": issue.get("title"),
                            "state": issue.get("state"),
                            "url": issue.get("html_url"),
                            "created_at": issue.get("created_at"),
                            "updated_at": issue.get("updated_at"),
                            "labels": [label.get("name") for label in issue.get("labels", [])]
                        }
                        for issue in issues
                    ]
                }
            else:
                return {"error": f"Falha ao listar issues", "status": response.status_code}
        except Exception as e:
            return {"error": str(e)}
    
    def process_message(self, message: dict) -> dict:
        """Process incoming MCP message"""
        method = message.get("method")
        params = message.get("params", {})
        
        if method == "initialize":
            return self.handle_initialize(params)
        elif method == "resources/list":
            return self.handle_resources_list()
        elif method == "tools/list":
            return self.handle_tools_list()
        elif method == "tools/call":
            result = self.call_tool(
                params.get("name"),
                params.get("arguments", {})
            )
            return {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, ensure_ascii=False, indent=2)
                    }
                ]
            }
        else:
            return {"error": f"Método desconhecido: {method}"}

def main():
    """Main entry point"""
    server = GitHubMCPServer()
    
    # Read from stdin and process messages
    for line in sys.stdin:
        try:
            if line.strip():
                message = json.loads(line)
                response = server.process_message(message)
                print(json.dumps(response, ensure_ascii=False))
                sys.stdout.flush()
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"JSON inválido: {str(e)}"}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
