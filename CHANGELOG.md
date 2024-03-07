# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

---

## [0.0.12] - 2024-02-22

### Changed

- Updated smsc.server.js to test the custom TLV 0x3005 parameter.

## [0.0.11] - 2023-11-13

### Changed

- Update axios version from ^1.3.2 to ^1.6.1 to fix the Cross-Site Request Forgery vulnerability (CVE-2023-45857) in package.json

## [0.0.10] - 2023-08-07

### Changed

- Updated package version for nodemon

## [0.0.10] - 2023-02-13

### Changed

- Updated packages
  - axios@1.3.2
  - awesome-phonenumber@5.1.0
  - jest@29.4.2
- Updated awesome-phonenumber code in mm7.validator.middleware

## [0.0.9] - 2022-11-02

### Added

- smpp server handle bind_transmitter and bind_receiver separately

## [0.0.8] - 2022-10-11

### Added

- deliver_sm responses to submit_sm requests for status and reply

## [0.0.7] - 2022-09-26

### Added

- Disabled sending x-powered-by header

## [0.0.6] - 2022-09-21

## Added

- Express app solely for health check endpoint to satisfy pcf health check
- Manifest to deploy to PCF

## Changed

- Moved axios from dev dependency to application dependencies as it is used in a helper function
- Moved code from server.js to index.js to be consistent with other applications in the stack

## [0.0.5] - 2022-07-29

### Added

- Disabled sending x-powered-by header

## [0.0.4] - 2022-07-29

### Added

- add middleware to convert xml to JSON in place (use plain xml2js)
- add test cases to cover 4001 envelope error
- add delivery report feature

### Changed

- rename tag in response in mms.response.helper.js
- Update verifyMmsEnvelope and parseMM7Envelope
- Update test cases by adding more assertion in 200x errors
- Update 404, 405 test cases
- Rename goodMM7Response and badMM&Response
- Shorten MMS_TEST_IMAGE variable

### Removed

- Remove test-coverage files in git and add the folder in gitignore
- Remove messaging-center in repo and docker-compose
- Remove express-xml-bodyparser since it does not work for some MM7 requests

### Fixed

- fix getStatusCodeText method to return correct text
- fix typos

## [0.0.3] - 2022-07-18

### Added

- Added `dev-inside-docker` to package.json so that when a developer is working on the stack, it will restart the container on file save.

## [0.0.2] - 2022-05-31

### Added

- Initial commit of mock servers
- Not exhaustive testing, more needs to be added
- SMSC mock server
- MMSC mock server

## [0.0.1] - 2022-04-29

### Changed

- Updated DockerFile port mapping

<!-- Template - To be left at end of file
## [Version Number] - [Date]
### Added
-   [List of additions]

### Changed
-   [List of changes]

### Deprecated
-   [List of deprecations]

### Removed
-   [List of removals]

### Fixed
-   [List of fixes]

### Security
-   [List of security related changes] -->
