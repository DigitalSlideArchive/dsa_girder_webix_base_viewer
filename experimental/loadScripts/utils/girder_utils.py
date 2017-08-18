def recurseGetItems(client, folderId):
    items = list(recurseGetResource(client, folderId, 'item'))
    folders = recurseGetResource(client, folderId, 'folder')
    
    for folder in folders:
        tmp = recurseGetItems(client, folder["_id"])
        items += list(tmp)

    return items

def recurseGetResource(client, parentId, resourceType, parentType='folder'):


    ### The recursion logic is broken here...
    """
    Recurse below the parent(indicated by parentId) and generate a list of all
    resources of type resourceType that existed under the parent.

    :param parentId: Id of the collection or folder to be searched.
    :type parentId: ObjectId
    :param resourceType: Either 'item' or 'folder'. Indicates whether nested
    folder data or item data should be collected.
    :type resourceType: str
    :param parentType: Either 'folder' or 'collection'. Indicates whether
    the parentId is a collection id or a folder id.
    :type parentType: str
    :returns: A list of all folders or items below parentId.
    :rtype: list of dict
    """
    # now get all folders
    resourceList = []

    try:
        folders = client.listFolder(parentId, parentFolderType=parentType)
    except girder_client.HttpError as err:
        printHttpError(err)
        return []

    #The line below is commented and moved below because this is an iterator and 
    #it consume the list only once, you will ending extending resourceList to None
    #folderIdList = getField(folders, '_id')

    if resourceType is 'item' and parentType is not 'collection':
        try:
            data = client.listItem(parentId)
            resourceList.extend(data)
        except girder_client.HttpError as err:
            print "HTTP Error thrown"

            printHttpError(err)
            return []
    elif resourceType is 'folder':
        resourceList.extend(folders)
    elif resourceType is not 'item' or resourceType is not 'folder':
        raise Exception('Invalid resourceType: %s' % resourceType)

    #folderIdList is an iterator and can only be consumed once. Do not move it up in the function
    folderIdList = getField(folders, '_id')

    ### The recursion does NOT work if you start with a collection.. probably iwll work if it's a folder.
    for folderId in folderIdList:
        #if re
        resourceList.extend(recurseGetResource(client, folderId, resourceType))

    return resourceList

def getField(data, strKey):
    return [i[strKey] for i in data]