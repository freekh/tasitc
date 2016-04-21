
const githubDb = require('js-github/mixins/github-db')
const createTree = require('js-git/mixins/create-tree')
const indexedDbCache = require('js-git/mixins/indexed-db')
const addCache = require('js-git/mixins/add-cache')
const memCache = require('js-git/mixins/mem-cache')
const readCombiner = require('js-git/mixins/read-combiner')
const formats = require('js-git/mixins/formats')
const walkers = require('js-git/mixins/walkers')
const modes = require('js-git/lib/modes')

const setup = (githubName, accessToken) => {
  const repo = {}
  githubDb(repo, githubName)
  createTree(repo)
  const cache = indexedDbCache
  cache.init('tasitc'+githubName, 1, err => { //TODO: <-?
    if (err) {
      console.error(err)
    }
  })
  addCache(repo, cache)
  memCache(repo)
  readCombiner(repo)
  formats(repo)
  walkers(repo)
  return repo
}

module.exports = {
  readTree: (cwd) => {
    const accessToken = null //TODO
    const cwdSplit = cwd.split('/')
    const githubName = cwdSplit.slice(0,2).join('/')
    const paths = cwdSplit.slice(2)
    const gitPath = '/'+ paths.join('/') + (paths.length > 0 ? '/' : '')
    const repo = setup(githubName, accessToken)
    return new Promise((resolve, reject) => {
      repo.readRef('refs/heads/master', (err, headHash) => {
        if (err) { reject(err) }
        repo.loadAs('commit', headHash, (err, commit) => {
          if (err) { reject(err) }
          repo.loadAs('tree', commit.tree, (err, tree) => {
            if (err) { reject(err) }
            repo.treeWalk(commit.tree, (err, treeStream) => {
              if (err) { reject(err) }
              const next = () => {
                treeStream.read((err, object) => { //O-b-vizzzoly recurse? :/
                  if (object && object.path === gitPath && object.body) {
		    const files = Object.keys(object.body).map(filename => {
		      const mode = object.body[filename].mode
		      const dir = modes.tree === mode
		      const file = modes.file === mode
		      const sym = modes.sym === mode
		      const exec = modes.exec === mode
		      return {
			filename,
			dir,
			file,
			sym,
			exec,
			mode
		      }
		    })
                    resolve(files)
                  } else if (object){
		    next()
                  } else {
		    resolve(null)
		  }
                })
              }
              next()
            })
          })
        })
      })
    })
  }
}
