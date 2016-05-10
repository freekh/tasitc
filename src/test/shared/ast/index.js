module.exports = {
  'basic ast test': (test) => {
    //google/drive/Test.gsheet --acount=(account -l freekh) | gsheet2json | html ($.columns[0] | li)
    //lookup('google/drive/Test.gsheet', { account: lookup('account', {l: 'freekh'})}).then(res => lookup('gsheet2json', res).then(res => lookup('html', res.columns[0].then(lookup('li')))))

    {
      type: 'Cmd',
      value: 'google/drive/Test.gsheet',
      args: [
        {
          type: 'Obj',
          value: {
            account: {
              type: 'Cmd',
              value: 'account',
              args: [
                {
                  type: 'Obj',
                  value: {
                    l: {
                      type: 'String',
                      value: 'freekh'
                    }
                  }
                }
              ]
            }
          }
        }
      ],
      then: {
        type: 'Cmd',
        value: 'gsheet2json',
        args: [
          { type: 'Res', value: 0 }
        ],
        then: {
          type: 'Cmd',
          value: 'html',
          args: [
            {
              type: 'Res',
              value: {
                type: 'Dot',
                value: {

                },

              }
            }
          ]
        }
      }

    }
  }
}
