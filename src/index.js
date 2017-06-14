import React, {Component} from 'react'
import {render} from 'react-dom'
import pipe from 'ramda/src/pipe'

import './main.css'

const emojis = [
  ':sunglasses:',
  ':smile:',
  ':laughing:',
  ':blush:',
  ':smiley:',
  ':relaxed:',
  ':smirk:',
  ':relieved:',
  ':laughing:',
  ':grin:',
  ':wink:',
  ':sweat_smile:',
  ':no_mouth:',
  ':see_no_evil:',
  ':hear_no_evil:',
  ':speak_no_evil:',
  ':smiley_cat:',
  ':smile_cat:',
  ':heart_eyes_cat:',
  ':kissing_cat:',
  ':smirk_cat:',
  ':scream_cat:',
  ':crying_cat_face:',
  ':joy_cat:',
  ':pouting_cat:',
]

const getRandomArbitrary = min => max =>
  () => Math.floor(Math.random() * (max - min)) + min

const getRandomIdx = arr => getRandom => () => arr[getRandom()]

const getRandomEmoji =
  getRandomIdx(emojis)(getRandomArbitrary(0)(emojis.length))

const around = after => befor => str => `${befor}${str}${after}`
const start = befor => str => `${befor}${str}`
const finish = after => str => `${str}${after}`

const bold = around('**\n')('**')
const startQuote = start('>> ')
const newLine = finish('\n')
const border = around('\n***')('***\n')
const boldInStartQuote = pipe(bold, startQuote)

class PrettyHistoryTelegram extends Component {
  state = {
    input: '',
    output: '',
    focus: true,
    isMobile: false,
  }

  transform = () => {
    const input = this.input.value

    if (!input.trim().length) {
      this.setState({output: '', input})
      return null
    }

    const {output} = input.split('\n').reduce((acc, rawLine) => {
      const line = rawLine.trim()
      const forwarded = false
      const reply = true
      const nicks = {...acc.nicks}
      const isReply = line.indexOf('In reply to') > -1
      const isForwarded = line.indexOf('Forwarded') > -1

      if (!acc.message
        && !isForwarded
        && this.state.isMobile
        && /:$/i.test(line)) { // mobile
        const nick = line.slice(0, line.length - 1)

        if (!nicks[nick]) nicks[nick] = getRandomEmoji()

        const output = [
          ...acc.output,
          bold(`${nick} ${nicks[nick]}`),
        ]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: true,
        }
      } else if (!isForwarded && /\[\d{2}:\d{2}\s[\wа-яё]+\]/i.test(line)) {
        const nextLine = line.split('[')
        const nick = nextLine[0]

        if (!nicks[nick]) nicks[nick] = getRandomEmoji()

        const output = [
          ...acc.output,
          bold(nextLine.join(` ${nicks[nick]} [`)),
        ]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: false,
        }
      } else if (!isForwarded
        && /\[\d{2}:\d{2}:\d{2}\s[\wа-яё]+\]/i.test(line)) {
        const nextLine = line.split('] ')
        const nick = nextLine[1]

        if (!nicks[nick]) nicks[nick] = getRandomEmoji()

        const output = [
          ...acc.output,
          bold(nextLine.join(`] ${nicks[nick]} `)),
        ]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: false,
        }
      } else if (!isForwarded
        && /\[\d{2}.\d{2}.\d{2}\s\d{2}:\d{2}\]/.test(line)) {
        const nextLine = line.split(',')
        const nick = nextLine[0]
        if (!nicks[nick]) nicks[nick] = getRandomEmoji()

        const forwarded = false
        const reply = true
        const output = [
          ...acc.output,
          bold(nextLine.join(` ${nicks[nick]} `)),
        ]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: false,
        }
      } else if (isReply || isForwarded) {
        const output = [...acc.output, boldInStartQuote(line)]

        return {
          ...acc,
          forwarded: true,
          reply,
          nicks,
          output,
          message: false,
        }
      } else if (line.length && line.indexOf('>') === 0 && acc.reply) {
        const reply = false
        const output = [...acc.output, boldInStartQuote(line.slice(2))]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: false,
        }
      } else if (line.length) {
        const output = [
          ...acc.output,
          `${acc.forwarded ? '>>' : '>'}${newLine(line)}`,
        ]

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          output,
          message: false,
        }
      }

      return acc
    }, {
      nicks: {},
      output: [],
      forwarded: false,
      reply: true,
      message: false,
    })

    this.setState({output: border(output.join('\n')), input})

    return null
  }

  handleToggle = () => {
    this.setState(prevState => ({focus: !prevState.focus}))
  }

  handleCheck = (e) => {
    this.setState({isMobile: e.target.checked}, this.transform)
  }

  handleCopy = (e) => {
    this.output.select()
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
    this.setState({output: ''})
  }

  handleClear = (e) => {
    this.setState({output: '', input: ''})
  }

  render() {
    const buttonStyle = {
      display: 'inline-block',
      border: '0px solid #fff',
      backgroundColor: 'black',
      color: '#fff',
      borderRight: '3px solid #fff',
      fontFamily: 'Rubik',
      cursor: 'pointer',
      outline: 0,
    }

    const textareaStyle = {
      flexBasis: '50%',
      padding: '10px',
      display: 'inline-block',
      border: '2px 0 2px 2px solid black',
      outline: 'none',
      borderLeft: 0,
      resize: 'none',
      fontFamily: 'Rubik',
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexBasis: '5%',
            backgroundColor: 'black',
          }}
        >
          <button
            style={buttonStyle}
            onClick={this.handleCopy}
          >
            {'Copy'}
          </button>
          <button
            style={buttonStyle}
            onClick={this.handleClear}
          >
            {'Clear'}
          </button>
          <button
            style={buttonStyle}
            onClick={this.transform}
          >
            {'Run'}
          </button>
          <label
            htmlFor="isMobile"
            style={{
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              marginLeft: '5px',
            }}
          >
            {'Mobile:'}
            <input
              id="isMobile"
              type="checkbox"
              checked={this.state.mobile}
              onClick={this.handleCheck}
              style={{marginLeft: '5px'}}
            />
          </label>
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <textarea
            style={textareaStyle}
            onChange={this.transform}
            value={this.state.input}
            ref={el => (this.input = el)}
            onClick={this.handleToggle}
            placeholder="You paste here"
          />
          <div style={{width: '5px', backgroundColor: 'black'}} />
          <textarea
            style={textareaStyle}
            readOnly
            value={this.state.output}
            onClick={this.handleToggle}
            placeholder="You copy here"
            ref={el => (this.output = el)}
          />
        </div>
      </div>
    )
  }
}

render(<PrettyHistoryTelegram />, document.getElementById('root'))
