export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint).then(data => data.json())
    .then(({login, name, public_repos, followers}) => ({
      login,
      name,
      public_repos,
      followers,
    }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()
  }

  load() {
    this.entries= JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userAlredyExists = this.entries.find(entry => entry.login.toUpperCase() === username.toUpperCase())

      if(userAlredyExists){
        throw new Error('Usuario ja cadastrado!')
      }

      const githubUser = await GithubUser.search(username)

      if(githubUser.login === undefined) {
        throw new Error('Usuario nao encontrado!')
      }

      this.entries = [githubUser, ...this.entries]
      this.update()
      this.save()
      this.root.querySelector('header input').value = ''
    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root) //O super serve para criar a "conexao" com a classe do extends, ela vai chamar o construtor e passar o root. o this.root passa entao a existir nessa classe

    this.tBody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('header button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('header input')
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      
      row.querySelector(".user img").src = `https://github.com/${user.login}.png`
      row.querySelector(".user p").textContent = user.name
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar?')

        if(isOk) {
          this.delete(user)
        }
      }

      this.tBody.append(row)
    })
  }

  removeAllTr() {
    this.tBody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }

  createRow() {
    const tr =document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/Marcelorpc.png" alt="Profile Image">
        <a href="https://github.com/Marcelorpc" target="_blank">
          <p>Marcelo Paiva 2</p>
          <span>marcelorpc2</span>
        </a>
      </td>

      <td class="repositories">
        88
      </td>

      <td class="followers">
        570
      </td>

      <td>
        <button class="remove">Remove</button>
      </td>
    `

    return tr
  }
}