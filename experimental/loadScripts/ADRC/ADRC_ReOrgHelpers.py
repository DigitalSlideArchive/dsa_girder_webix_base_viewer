def getFolderID_for_FolderName_in_ParentFolder( girderClient, folderName, parentFolderID, parentType='folder'):
    """Since a folder name may (or may not) be unique across a collection, or across girder
    This will search for folder FOO in the folder BAR, and will create a folder if it doesn't exist yet"""
    gc = girderClient
    
    try:
        folderData = gc.createFolder(parentFolderID , folderName, parentType=parentType)
    except:
        requestUrl = 'folder?parentType=%s&parentId=%s&name=%s&limit=50&sort=lowerName&sortdir=1' % (parentType, parentFolderID, folderName)
        folderData = gc.getResource(requestUrl)[0]
        
    return folderData['_id']

def lookupItemByName( girderClient, parentFolderID, itemName):
    """Sees if an item of FOO already exists in folder BAR"""
    gc = girderClient
    try:
        itemData = gc.get('/item?folderId=%s&name=%s&limit=50&offset=0&sort=lowerName&sortdir=1' % (parentFolderID,itemName ))
        return itemData
        #print itemData
    except:
        #print "Found no item data"
        ### no item found
        return False
    
def copySlideToCuratedFolder( girderClient, itemData, metaData, namingScheme, curatedFolderID ):
    """Assuming namingScheme = ADRC, which creates a subject folder and a stain folder"""
    
    
    gc= girderClient
    
    ## Refactor this to maybe just have it uses those keys in a list or something?
    if  namingScheme == 'patientID_stainType':
        ## This could maybe recurse based on splitting the namingScheme, but may become hard to read
        firstBranchName = metaData['patientID']
        secondBranchName = metaData['stainType']
        firstBranch_FolderID = getFolderID_for_FolderName_in_ParentFolder( gc,firstBranchName,curatedFolderID)
        ### The parent folder for the second branch is what's returned from the previous staement
        secondBranch_FolderID = getFolderID_for_FolderName_in_ParentFolder( gc,secondBranchName,firstBranch_FolderID)
        
        ### Check if item already exists in the targetFolder
        if not lookupItemByName( gc, secondBranch_FolderID, itemData['name']):
            print "Moving the folder to %s / %s " %  ( metaData['patientID'], metaData['stainType'] )
            try:
                gc.post("item/" + itemData['_id'] + '/copy', {"folderId": secondBranch_FolderID})
            except:
                print "failed " + folderName
                pass

def validateSlideMetaData( slideMetaData, namingScheme):
    validStainTypes = ['HE', 'AB', 'SYN', 'BIEL','TAU', 'UBIQ','THIO']
    
    errors = []
    if slideMetaData['stainType'] not in validStainTypes:
        errors.append(('StainType',slideMetaData['stainType']))
    
    if not slideMetaData['patientID']:
         errors.append(('InvalidPatientID',slideMetaData['patientID']))
            
    if len(slideMetaData['blockID']) !=2:
         errors.append(('InvalidBlockID',slideMetaData['blockID']))
    
    if len(errors) > 0:
        return (False, errors)
    else:
        return (True, [])
    
