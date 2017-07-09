import React, {Component} from 'react'
import {render} from 'react-dom'

import Button from 'react-bootstrap/lib/Button'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar'
import Toggle from 'react-toggle'
import pipe from 'ramda/src/pipe'
import join from 'ramda/src/join'
import adjust from 'ramda/src/adjust'
import toUpper from 'ramda/src/toUpper'
import partial from 'ramda/src/partial'

import 'normalize.css/normalize.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toggle/style.css'
import styles from './index.css'

import emojis from './emojis-by-categories.json'

const MOBILE = 'mobile'
const DESKTOP = 'desktop'

const toUpperFirst = pipe(
  partial(adjust, [toUpper, 0]),
  join('')
)

const getRandomArbitrary = min => max =>
  () => Math.floor(Math.random() * (max - min)) + min

const getRandomIdx = arr => getRandom => () => arr[getRandom()]

const getRandomEmoji =
  getRandomIdx(emojis.people)(getRandomArbitrary(0)(emojis.people.length))

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
    isAvatars: true,
  }

  transform = () => {
    const input = this.input.value

    if (!input.trim().length) {
      this.setState({output: '', input})
      return null
    }

    const {output} = input.split('\n').reduce((acc, rawLine) => {
      const forwarded = false
      const reply = true
      const message = false
      const nicks = {...acc.nicks}
      const line = rawLine.trim()
      const isReply = line.indexOf('In reply to') > -1
      const isForwarded = line.indexOf('Forwarded') > -1

      if (!acc.message
        && !isForwarded
        && this.state.isMobile
        && /:$/i.test(line)) { // mobile
        const nick = line.slice(0, line.length - 1)

        if (!nicks[nick] && this.state.isAvatars) nicks[nick] = getRandomEmoji()

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          message: true,
          output: [
            ...acc.output,
            bold(this.state.isAvatars ? `${nick} ${nicks[nick]}` : nick),
          ],
        }
      } else if (!isForwarded && /\[\d{2}:\d{2}\s[\wа-яё]+\]/i.test(line)) {
        const nextLine = line.split('[')
        const nick = nextLine[0]

        if (!nicks[nick] && this.state.isAvatars) nicks[nick] = getRandomEmoji()

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          message,
          output: [
            ...acc.output,
            bold(this.state.isAvatars ? nextLine.join(` ${nicks[nick]} [`)
            : nextLine.join('')),
          ],
        }
      } else if (!isForwarded
        && /\[\d{2}:\d{2}:\d{2}\s[\wа-яё]+\]/i.test(line)) {
        const nextLine = line.split('] ')
        const nick = nextLine[1]

        if (!nicks[nick] && this.state.isAvatars) nicks[nick] = getRandomEmoji()

        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          message,
          output: [
            ...acc.output,
            bold(
              this.state.isAvatars
                ? nextLine.join(`] ${nicks[nick]} `)
                : nextLine.join('')
            ),
          ],
        }
      } else if (!isForwarded
        && /\[\d{2}.\d{2}.\d{2}\s\d{2}:\d{2}\]/.test(line)) {
        const nextLine = line.split(',')
        const nick = nextLine[0]

        if (!nicks[nick] && this.state.isAvatars) nicks[nick] = getRandomEmoji()

        return {
          ...acc,
          nicks,
          message,
          forwarded: false,
          reply: true,
          output: [
            ...acc.output,
            bold(
              this.state.isAvatars
                ? nextLine.join(` ${nicks[nick]} `)
                : nextLine.join('')
            ),
          ],
        }
      } else if (isReply || isForwarded) {
        return {
          ...acc,
          reply,
          nicks,
          message,
          forwarded: isForwarded,
          output: [...acc.output, boldInStartQuote(line)],
        }
      } else if (line.length && line.indexOf('>') === 0 && acc.reply) {
        return {
          ...acc,
          forwarded,
          nicks,
          message,
          reply: false,
          output: [...acc.output, boldInStartQuote(line.slice(2))],
        }
      } else if (line.length) {
        return {
          ...acc,
          forwarded,
          reply,
          nicks,
          message,
          output: [
            ...acc.output,
            `${acc.forwarded ? '>>' : '>'}${newLine(line)}`,
          ],
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

  handleAvatarsToggle = () => {
    this.setState(prevState => ({isAvatars: !this.state.isAvatars}))
  }

  handleFocusToggle = () => {
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

  handleClear = e => this.setState({output: '', input: ''})

  handleSelect = key => this.setState({isMobile: key === MOBILE})

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Button
            className={styles.button}
            bsStyle="default"
            onClick={this.handleCopy}
          >
            Copy
          </Button>
          <Button
            className={styles.button}
            bsStyle="default"
            onClick={this.handleClear}
          >
            Clear
          </Button>
          <Button
            className={styles.button}
            bsStyle="default"
            onClick={this.transform}
          >
            Run
          </Button>
          <ButtonToolbar className={`${styles.dropdown}`} >
            <DropdownButton
              id="dropdown-basic"
              style={{width: '100px'}}
              title={toUpperFirst(this.state.isMobile ? MOBILE : DESKTOP)}
            >
              <MenuItem
                eventKey={DESKTOP}
                active={!this.state.isMobile}
                onSelect={this.handleSelect}
              >
                {toUpperFirst(DESKTOP)}
              </MenuItem>
              <MenuItem
                eventKey={MOBILE}
                active={this.state.isMobile}
                onSelect={this.handleSelect}
              >
                {toUpperFirst(MOBILE)}
              </MenuItem>
            </DropdownButton>
            <div className={styles.toggle}>
              <label
                className={styles.title}
                htmlFor="toggle-avatars"
              >
                Avatars:
              </label>
              <Toggle
                id="toggle-avatars"
                defaultChecked={this.state.isAvatars}
                onChange={this.handleAvatarsToggle}
              />

            </div>
          </ButtonToolbar>
        </div>
        <div className={styles.main}>
          <textarea
            className={styles.area}
            value={this.state.input}
            ref={el => (this.input = el)}
            placeholder="You paste here..."
            onChange={this.transform}
            onClick={this.handleFocusToggle}
          />
          <textarea
            readOnly
            className={styles.area}
            value={this.state.output}
            ref={el => (this.output = el)}
            placeholder="You copy here..."
            onClick={this.handleFocusToggle}
          />
        </div>
      </div>
    )
  }
}

render(<PrettyHistoryTelegram />, document.getElementById('root'))
