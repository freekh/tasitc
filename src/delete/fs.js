
const githubDb = require('js-github/mixins/github-db')
const createTree = require('js-git/mixins/create-tree')
const indexedDbCache = require('js-git/mixins/indexed-db')
const addCache = require('js-git/mixins/add-cache')
const memCache = require('js-git/mixins/mem-cache')
const readCombiner = require('js-git/mixins/read-combiner')
const formats = require('js-git/mixins/formats')
const walkers = require('js-git/mixins/walkers')

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
  readTree: (githubName, accessToken) => {
    const repo = setup(githubName, accessToken)
    console.log('reading', githubName)
    return new Promise((resolve, reject) => {
      repo.readRef('refs/heads/master', (err, headHash) => {
        if (err) { reject(err) }
        repo.loadAs('commit', headHash, (err, commit) => {
          if (err) { reject(err) }
          repo.loadAs('tree', commit.tree, (err, tree) => {
            if (err) { reject(err) }
            repo.treeWalk(commit.tree, (err, treeStream) => {
              if (err) { reject(err) }
              let res = []
              const next = () => {
                treeStream.read((err, object) => {
                  if (object) {
                    res.push(object)
                    next()
                  } else {
                    console.log('resovling', res)
                    resolve(res)
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

//const accessToken = process.env['GITHUB_ACCESS_TOKEN']
//
// const fs = gitTree({
//   configs: {
//     '': {},
//   },
//   repos: {
//     '': repo,
//   },
//   createRepo: (config) => {
//     console.log('createRepo', config)
//   },
//   getRootHash: () => {
//     console.log('getRootHash')
//     return '2f31e5be090dfe999f22cb09d3b7b835ac08c5ba'
//   },
//   setRootHash: (rootHash) => {
//     console.log('setRootHash', rootHash)
//   },
//   saveConfig: (config) => {
//     console.log('saveConfig', config)
//   }
// })
// console.log(fs.readTree('/README.md', (err, tree) => {
//   console.log('fs tree', err, tree)
// }))
