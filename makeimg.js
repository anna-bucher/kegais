#!/usr/bin/env node
'use strict'
const gm = require ( 'gm' )
const fs = require ( 'fs' )
const formats =
[ { name: 'med'
  ,    w: 1024
  ,    h:  683
  ,    q:  90  // quality
  }
, { name: 'thumb'
  ,    w:  485
  ,    h:  342
  ,    q:  90
  }
, { name: 'full'
  ,    q:  100
  }
]

const pad = function ( txt, size )
{ txt = txt || ''
  let p = size - ( txt + '').length
  if ( p > 0 )
  { return ( ' '.repeat ( p ) ) + txt
  }
  else
  { return txt
  }
}

const imgPath = function ( img, directory, filename )
{ return `${ directory }/${ img.name }/${ filename }.jpg`
}

const crop = function ( img, w, h )
{
  let x = 0
  let y = 0
  if ( img.h > h )
  { y = ( img.h - h ) / 2
  }
  else
  { x = ( img.w - w ) / 2
  }
  img.w = w
  img.h = h
  img.gm.crop ( w, h, x, y )
}

const resize = function ( img, scale )
{ img.w *= scale
  img.h *= scale
  img.gm.resize ( img.w, img.h )
}

const writeImg = function ( img, clbk )
{ img.gm.write
  ( img.path
  , clbk
  )
}

const makeImage = function ( format, source, directory, filename )
{ let img =
  { gm:   gm ( source ).quality ( format.q )
  , path: imgPath ( format, directory, filename )
  }
  
  img.gm.size
  ( function ( err, size )
    { if ( err )
      { console.log ( '      ' + err )
      }
      else
      { img.w = size.width
        img.h = size.height
        let scale  = 1.0
        if ( format.w )
        { scale = Math.max ( format.w / img.w, format.h / img.h )
        }

        resize ( img, scale )
        crop   ( img, format.w || img.w, format.h || img.h )
        writeImg
        ( img
        , function ( err )
          { if ( err )
            { console.log ( `    ${ pad ( format.name, 6 ) } ( ${ pad ( format.w, 5 ) }x${ pad ( format.h, 5 ) } ) : ${ err }` )
            }
            else
            { console.log ( `    ${ pad ( format.name, 6 ) } ( ${ pad ( format.w, 5 ) }x${ pad ( format.h, 5 ) } ) : ${ img.path }` )
            }
          }
        )
      }
    }
  )
}

let source  = process.argv [ 2 ]
let article = process.argv [ 3 ]
let match   = article.match ( /^(.+)\/([^\/]+)\.([^.]+)$/ )
let directory = 'public/images'
let filename  = match [ 2 ]
console.log ( `Using ${ source } to build :` )
for ( let i = 0; i < formats.length; ++i )
{ let format = formats [ i ]
  makeImage ( format, source, directory, filename )
}

fs.stat
( article
, function ( err, stat )
  { if ( err )
    { // file does not exist, create it
      fs.writeFile
      ( article
      , filename
      , ( err ) =>
        { if ( !err )
          { console.log ( `    ${ pad ( 'article', 6 ) } ( ${ pad ( '', 5 ) } ${ pad ( '', 5 ) } ) : ${ article }` )
          }
          else
          { console.log ( `    ${ pad ( 'article', 6 ) } ( ${ pad ( '', 5 ) } ${ pad ( '', 5 ) } ) : ${ err }` )
          }
        }
      )
    }
  }
)
