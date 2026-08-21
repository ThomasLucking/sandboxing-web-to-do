# Web todo list

A simple, modern to-do list web app built with plain HTML, CSS and TypeScript
(no frameworks or libraries). To-dos and categories are persisted through a
hosted RESTful API rather than local storage, so your list is available
wherever you open the app.

## Features

- Create to-dos with optional due dates and an optional category.
- Mark to-dos as done/undone with a checkbox; completed items are shown with
  strikethrough styling.
- Remove individual to-dos, or clear the entire list with one click.
- Live text search that filters the visible list as you type.
- Due dates are color-coded by urgency (overdue, due today, due soon, due
  later), and a banner appears at the top of the page whenever any to-do is
  overdue.
- Manage categories (name + color) in their own section: create, rename,
  recolor and delete them. Assigning a category to a to-do colors that
  to-do's border and shows the category name on the item.
- All data (to-dos and categories) is stored on a remote REST API, with a
  loading indicator and error messages for network issues.

## Prerequisites

- [Node.js](https://nodejs.org) version 24. **Use [fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation) to get the latest version**
- [Pnpm](https://pnpm.io/installation#on-posix-systems) version 10. **Use pnpm official script for posix systems**

## Setup

1. Clone this repository.
2. From your CLI, move to the project repository with `cd`.
3. Install the dependencies with `pnpm i`.
4. Start the dev server with `pnpm dev` and open [localhost:5173](http://localhost:5173/).

That's all! You are ready to go.

## Available scripts

- `pnpm dev` — launch the development server on [localhost:5173](http://localhost:5173/).
- `pnpm build` — type-check and build the production bundle into `dist/`.
- `pnpm check-types` — run the [TypeScript](https://www.typescriptlang.org/) type checker.
- `pnpm format` — format all project files with [biome](https://biomejs.dev/).
- `pnpm lint` — run the biome linter.

Run `pnpm format` and `pnpm lint` before committing.

## Continuous integration & deployment

This repo includes two [GitHub Actions](https://docs.github.com/en/actions) workflows:

- One deploys the project to GitHub Pages automatically on every push to `main`.
- One checks formatting, linting and types on every pull request.
