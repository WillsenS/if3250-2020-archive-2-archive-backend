# ARCHIVE 2 PPID : Backend

## Overview

This is the backend system that will support ppid-frontend.

## 1. Requirement

- Node JS 12.13.1
- MongoDB 3.6.3

## 2. Documentation

### Env example

```sh
MONGODB_URI=mongodb://localhost:27017/archive-backend
BASE_URL=http://localhost:3000
SESSION_SECRET=pP1D1tB2020!
NODE_ENV=development
```

There are 2 types of documentation, api documentation for swagger and jsdoc documentation for helpers and methods

- **helpers**, handlers middlewares will be documented on JSDOC
- **routes** will be documented on swagger format.

## 3. Run

```sh
npm run start
```
