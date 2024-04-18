# Before run the server install flask lib:
# $ pip install flask
# $ pip3 install flask
# $ python3 pip install flask
# server: http://127.0.0.1:5000

from flask import Flask, jsonify, request
import os
import json

PORT_NUMBER = 5000
ROOT_DIR = 'files'


def readAllDirsWithFiles():
  data = {}
  if os.path.isdir(ROOT_DIR):
    dirs = os.listdir(ROOT_DIR)
    print('Files:')
    for dirTitle in dirs:
      dirPath = ROOT_DIR + '/' + dirTitle
      if not dirTitle.startswith('.') and os.path.isdir(dirPath):
        print('  ',dirTitle,'/',sep='')
        data[dirTitle] = []
        files = os.listdir(dirPath)

        for file in files:
          fileTitle, fileExtension = split(file, '.')
          filePath = ROOT_DIR + '/' + dirTitle + '/' + file
          if isValidJSONFile(filePath):
            print('   ', file)
            data[dirTitle].append(fileTitle)
  else:
    os.mkdir(ROOT_DIR)
  return data

def isValidJSONFile(filePath):
  fileTitle, fileExtension = split(filePath, '.')
  return os.path.isfile(filePath) and not fileTitle.startswith('.') and fileExtension == 'json'


def split(txt, rdelim):
  rdelimIndex = txt.rindex(rdelim)
  return (txt[0:rdelimIndex], txt[rdelimIndex + 1:])

#---------------
#     INIT
#---------------

app = Flask(__name__)
data = readAllDirsWithFiles()


#---------------
#     API
#---------------

@app.route('/api')
def isReady():
  return 'Server is ready!', 200


#---------------
#     DIRS
#---------------

@app.route('/api/dirs', methods=['GET'])
def get_all_dirs():
  return jsonify(data), 200

@app.route('/api/dirs', methods=['POST'])
def create_dir():
  dirDto = request.get_json()
  dirTitle = dirDto.get('title')
  if not dirTitle:
    return 'Title not specified!', 400
  if dirTitle in data.keys():
    return 'А directory with the title <' + dirTitle + '> already exists!', 400
  os.mkdir(ROOT_DIR + '/' + dirTitle)
  data[dirTitle] = []
  return 'ok', 200

@app.route('/api/dirs/<string:dirTitle>', methods=['PUT'])
def update_dir(dirTitle):
    dirDto = request.get_json()
    newDirTitle = dirDto.get('title')
    if not newDirTitle:
      return 'Title not specified!', 400
    if newDirTitle in data.keys():
      return 'А directory with the title <' + newDirTitle + '> already exists!', 400
    os.rename(ROOT_DIR + '/' + dirTitle, ROOT_DIR + '/' + newDirTitle)
    data[newDirTitle] = data[dirTitle]
    del data[dirTitle]
    return 'ok', 200

#---------------
#     DOCS
#---------------

@app.route('/api/dirs/<string:dirTitle>/docs/<string:docTitle>', methods=['GET'])
def get_doc(dirTitle, docTitle):
  filePath = ROOT_DIR + '/' + dirTitle + '/' + docTitle + '.json'
  if docTitle in data.get(dirTitle):
    file = open(filePath, 'rt')
    fileContent = file.read()
    file.close()
    return json.loads(fileContent), 200
  else:
    return 'File not found!', 400

@app.route('/api/dirs/<string:dirTitle>/docs', methods=['POST'])
def create_doc(dirTitle):
  if data.get(dirTitle) is None:
    return 'Directory <' + dirTitle + '> not found!', 400

  docDto = request.get_json()
  docTitle = docDto.get('title')
  if not docTitle:
    return 'Title not specified!', 400

  if docTitle in data.get(dirTitle):
    return 'А doc with the title <' + docTitle + '> already exists!', 400

  filePath = ROOT_DIR + '/' + dirTitle + '/' + docTitle + '.json'
  file = open(filePath, 'xt')
  json.dump(docDto, file)
  file.close()
  data[dirTitle].append(docTitle)
  return 'ok', 200

@app.route('/api/dirs/<string:dirTitle>/docs/<string:docTitle>', methods=['PUT'])
def update_doc(dirTitle, docTitle):
  docDto = request.get_json()
  newDocTitle = docDto.get('title')
  if not newDocTitle:
    return 'Title not specified!', 400
  if docTitle != newDocTitle and newDocTitle in data.get(dirTitle):
    return 'А doc with the title <' + newDocTitle + '> already exists!', 400

  if docTitle != newDocTitle:
    os.rename(ROOT_DIR + '/' + dirTitle + '/' + docTitle + '.json', ROOT_DIR + '/' + dirTitle + '/' + newDocTitle + '.json')
    data[dirTitle] = [newDocTitle if x == docTitle else x for x in data[dirTitle]]


  filePath = ROOT_DIR + '/' + dirTitle + '/' + newDocTitle + '.json'
  file = open(filePath, 'wt')
  json.dump(docDto, file)
  file.close()
  return 'ok', 200


#---------------
#     HEADERS
#---------------

@app.after_request
def apply_caching(response):
  response.headers["Access-Control-Allow-Origin"] = "*"
  response.headers["Access-Control-Allow-Methods"] = "POST, PUT, GET, OPTIONS, DELETE"
  response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept,"
  return response


if __name__ == '__main__':
  app.run(debug=True, port=PORT_NUMBER)
  

