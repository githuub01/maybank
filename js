var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);
var prefix = " ["+tw.local.POLICYNO+"-"+tw.system.process.instanceId+"] ";

logger.debug(prefix+"---------------------------");

if(tw.local.CONCURRENTPOLICY !=null) {
    tw.local.ISCONCURENT = tw.local.CONCURRENTPOLICY.search("-") > -1;
    if(tw.local.ISCONCURENT == false)
       tw.local.CONCURRENTPOLICY = ""; 
} else {
    tw.local.ISCONCURENT = false    
}

//[13Nov2018] Commented code for enhancement to have new Scan Sources for Esub/TH cases.  New Scan Source codes are now
//   in the environment variable.
//if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length == 2) {
//    tw.local.SCANSOURCE = tw.local.REFERENCENUMBER; 
//}else if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {
//    if(tw.local.REFERENCENUMBER.substr(0,2) == 'TH') {
//        tw.local.SCANSOURCE = 'TH';    
//    } else {
//        tw.local.SCANSOURCE = 'EZ'
//    }
//}



if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length == 2) {
    tw.local.SCANSOURCE = tw.local.REFERENCENUMBER; 
}else if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {

    var scansourcelist = tw.env.EZSUBSCANSOURCE;

    if(scansourcelist.search(tw.local.REFERENCENUMBER.substr(0,2))>=0) {
        tw.local.SCANSOURCE = tw.local.REFERENCENUMBER.substr(0,2);    
    } else {
        tw.local.SCANSOURCE = 'EZ';
    }            
}

var nonsubcmcode = tw.env.NONPOSCHANNEL;

if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {
    if(nonsubcmcode.search(tw.local.CHANNEL) < 0 && tw.local.SCANSOURCE == 'EZ')
    { tw.local.ISPOSUWCASE = true;  }
}

logger.debug(prefix+"START :"+tw.system.step.name);


var policyNo = "POLICYNO";
var processName = tw.system.process.name;

// Cond 1 "POLICYNO" == tw.local.POLICYNO
var policyCol = new TWSearchColumn();
policyCol.name = policyNo;
policyCol.type = TWSearchColumn.Types.BusinessData;

var policyCond = new TWSearchCondition();
policyCond.column = policyCol;
policyCond.operator = TWSearchCondition.Operations.Equals;
policyCond.value = tw.local.POLICYNO;

//Cond 2 Process instance name == tw.system.process.name

var processCol = new TWSearchColumn();
processCol.type = TWSearchColumn.Types.Process;
processCol.name = TWSearchColumn.ProcessColumns.Name;

var processCond = new TWSearchCondition();
processCond.column = processCol;
processCond.operator = TWSearchCondition.Operations.Equals;
processCond.value = processName;

//Cond 3 & 4 & 5 ProcessInstance Status != Completed || Failed || Terminated

var instanceStatusCol = new TWSearchColumn();
instanceStatusCol.type = TWSearchColumn.Types.ProcessInstance;
instanceStatusCol.name = TWSearchColumn.ProcessInstanceColumns.Status;
    
var instanceStatusCond1 = new TWSearchCondition();
instanceStatusCond1.column = instanceStatusCol;
instanceStatusCond1.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond1.value = TWProcessInstance.Statuses.Completed;
    
var instanceStatusCond2 = new TWSearchCondition();
instanceStatusCond2.column = instanceStatusCol;
instanceStatusCond2.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond2.value = TWProcessInstance.Statuses.Failed;

var instanceStatusCond3 = new TWSearchCondition();
instanceStatusCond3.column = instanceStatusCol;
instanceStatusCond3.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond3.value = TWProcessInstance.Statuses.Terminated;

var search = new TWSearch();
search.columns = new Array(policyCol,processCol);
search.conditions = new Array(policyCond,processCond,instanceStatusCond1,instanceStatusCond2,instanceStatusCond3);
search.organizedBy = TWSearch.OrganizeByTypes.ProcessInstance;
search.orderBy = new Array();


var results = search.execute();
var count = results.rows.length;

logger.debug(prefix+"Search Result ="+count);

if(count < 2) {
    tw.local.DECISION = "NODUPLICATE";
} else {
    tw.local.DECISION = "DUPLICATE";
}

logger.debug(prefix+"DECISION ="+tw.local.DECISION); 

logger.debug(prefix+"END :"+tw.system.step.name);








var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);
var prfx = " ["+tw.local.POLICYNO+"-"+tw.system.process.instanceId+"] ";

logger.debug(prfx +" tw.local.CONSURENTTASKIDS ="+tw.local.CONSURENTTASKIDS);

var taskID= "";
for(var i = 0; tw.local.CONSURENTTASKIDS != null && i<tw.local.CONSURENTTASKIDS.listLength;i++) {
    taskID = tw.local.CONSURENTTASKIDS[i];
    logger.debug(prfx +"Start Processing="+taskID);
    try {
        var task = tw.system.findTaskByID(taskID);
        var assignedTo = task.assignedTo.name;
        if(assignedTo.search("All Users") != 0) {
            logger.debug(prfx +"Assiging back to role All Users")
            task.reassignBackToRole();
        } else {
            logger.debug(prfx +"Task at All Users role")                
        }
        var user = tw.system.org.findUserByName("tw_admin");
        if(task !=null) {
            var inputVar = new tw.object.Map();
            inputVar.put("RESUMEDBY", "PRI");
            task.complete(user,inputVar);
            logger.debug(prfx +"Task Completed for TaskID ="+taskID);
        }
       logger.debug(prfx +"Finished Processing="+taskID);
    } catch(e) {
            logger.debug(prfx +"Task Completion Failed for TaskID ="+taskID);    
    }   
}












function addParameter(type, value, mode) {
    var param = new tw.object.SQLParameter();
    param.type = type;
    param.value = value ;
    param.mode = mode;
    tw.local.Parameters[tw.local.Parameters.listLength] = param;
}

tw.local.Parameters = new tw.object.listOf.SQLParameter();

addParameter("VARCHAR",tw.local.POLICYNO,"IN");
addParameter("VARCHAR",tw.local.INSTANCEID,"IN");
addParameter("VARCHAR",tw.local.ACTIVITYNAME,"IN");
addParameter("VARCHAR",tw.local.WAITINGACTIVITY,"IN");
addParameter("VARCHAR",tw.local.CONCURENTFIELD,"IN");
addParameter("VARCHAR",tw.local.CONCURENTVALUE,"IN");
//addParameter("INTEGER","0","IN");



tw.local.Query = "INSERT INTO CONCURENT_CASES(POLICYNO,INSTANCEID,ACTIVITY,WAITINGACTIVITY,CONCURENTFIELD,CONCURENTVALUE) VALUES(?,?,?,?,?,?)";



tw.local.sql = "INSERT INTO AIS_WSIS_TRACKER (CASEID,REQUESTXML,REQUESTTIME, CALLTYPE, CORRELATIONID) VALUES (?, ?, current_timestamp,?,?)";
var conn = null;
var st = null;
try {
    var ds = new Packages.javax.naming.InitialContext().lookup(tw.env.PRCDEVJNDI);
    conn = ds.getConnection();
    st = conn.prepareStatement(tw.local.sql);
    st.setString(1, tw.local.CASEID);
    st.setString(2, tw.local.REQUESTXML);
    st.setString(3, tw.local.METHOD);
    st.setString(4, tw.local.CORRELATIONID);
    st.executeUpdate();
} finally {
    if (st != null) st.close();
    if (conn != null) conn.close();
}



//tw.local.RESPONSEOBJ = new tw.object.UREOUTPUT();
var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);
var prefix = " ["+tw.local.CASEID+"-"+tw.system.currentProcessInstanceID+"] ";

tw.local.RESPONSE =tw.local.RESPONSEXML.toString(true);
var myRegExp=new RegExp("&lt;","g")
var myRegExp1=new RegExp("&gt;","g")

tw.local.RESPONSE = tw.local.RESPONSE.replace(myRegExp, "<")
tw.local.RESPONSE = tw.local.RESPONSE.replace(myRegExp1, ">")
tw.local.RESPONSE = tw.local.RESPONSE.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>","");

//tw.local.RESPONSEOBJ.RESPONSEXML = tw.local.RESPONSE
tw.local.xml = tw.local.RESPONSE;
tw.local.RESPONSESTR = tw.local.xml.xpath("//caseXML/case").item(0).toString(true);

var polUW = 
    '<policyUnderwriting>'+
        '<policyEntity type="case">'+
            '<life400PollicyLevelResult>'+tw.local.AISPOLICYOUTCOME+'</life400PollicyLevelResult>'+
        '</policyEntity>'+
    '</policyUnderwriting>'+
'</case>';

//if(tw.local.AISPOLICYOUTCOME != null && tw.local.AISPOLICYOUTCOME != "") {
    tw.local.RESPONSESTR = tw.local.RESPONSESTR.replace("</case>",polUW);
//} else {
//    tw.local.RESPONSE = tw.local.RESPONSESTR;
//}

//tw.local.ISREPLACEMENTPOLICY = false;
if(tw.local.ISPOSUW == true) {
    var attributeNodes =  tw.local.xml.xpath("//caseXML/case/caseData/entity/attribute[@name='REPLACEMENT_STATUS']");  
        var noofEntity = attributeNodes.length;
        if(noofEntity != 0) {
            for(var a=0;a<noofEntity;a++) {
                var flowValue =  attributeNodes.item(a).getAttribute("value").toString();    
                if(flowValue == "TRUE" || flowValue == "true") {
                    tw.local.ISREPLACEMENTPOLICY = true;
                    break;
                }
            }
        }
}   

logger.debug(prefix+"tw.local.ISREPLACEMENTPOLICY: "+tw.local.ISREPLACEMENTPOLICY);
var myDate = new TWDate();
var date = myDate.format("EEEE, MMM d, yyyy hh:mm:ss aaa");



var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);
var prefix = " ["+tw.local.POLICYNO+"-"+tw.system.currentProcessInstanceID+"] ";

var recCount = tw.local.OutputResult[0].rows.listLength;

logger.debug(prefix+"REQUIREMENT COUNT"+recCount);

tw.local.REASON = "";
var reason = ""
for(var i=0;i<recCount;i++) {
    reason = tw.local.OutputResult[0].rows[i].indexedMap.REASON;
    if(reason != null && reason != "") {
        if(tw.local.REASON == "")
            tw.local.REASON = reason;
        else 
            tw.local.REASON = tw.local.REASON +" | "+ reason;        
    }
}


var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);


logger.debug("START : Searching Concurent processes for CONCURENT FIELD ="+tw.local.CONCURRENTPRIMARY +" for Waiting Activity = 'ESM-LTC Waiting'");

var concurentCol = new TWSearchColumn();
concurentCol.name = "CONCURRENTPOLICY";
concurentCol.type = TWSearchColumn.Types.BusinessData;

var instanceID = new TWSearchColumn();
instanceID.type = TWSearchColumn.Types.ProcessInstance;
instanceID.name = TWSearchColumn.ProcessInstanceColumns.ID;

var instanceStatus = new TWSearchColumn();
instanceStatus.type = TWSearchColumn.Types.ProcessInstance;
instanceStatus.name = TWSearchColumn.ProcessInstanceColumns.Status;

var taskID = new TWSearchColumn();
taskID.type = TWSearchColumn.Types.Task;
taskID.name = TWSearchColumn.TaskColumns.ID;

var taskStatus = new TWSearchColumn();
taskStatus.type = TWSearchColumn.Types.Task;
taskStatus.name = TWSearchColumn.TaskColumns.Status;

var taskAssignment = new TWSearchColumn();
taskAssignment.type = TWSearchColumn.Types.Task;
taskAssignment.name = TWSearchColumn.TaskColumns.AssignedToUser;

var taskName = new TWSearchColumn();
taskName.type = TWSearchColumn.Types.Task;
taskName.name = TWSearchColumn.TaskColumns.Activity;

var concurentCond = new TWSearchCondition();
concurentCond.column = concurentCol;
concurentCond.operator = TWSearchCondition.Operations.StartsWith;
concurentCond.value = tw.local.CONCURRENTPRIMARY;

var taskStatusCond = new TWSearchCondition();
taskStatusCond.column = taskStatus;
taskStatusCond.operator = TWSearchCondition.Operations.Equals;
taskStatusCond.value = TWTask.Statuses.Received;

var taskNameCond = new TWSearchCondition();
taskNameCond.column = taskName;
taskNameCond.operator = TWSearchCondition.Operations.StartsWith;
taskNameCond.value = "ESM-LTC Waiting";

//Cond 3 & 4 & 5 ProcessInstance Status != Completed || Failed || Terminated

var instanceStatusCol = new TWSearchColumn();
instanceStatusCol.type = TWSearchColumn.Types.ProcessInstance;
instanceStatusCol.name = TWSearchColumn.ProcessInstanceColumns.Status;
    
var instanceStatusCond1 = new TWSearchCondition();
instanceStatusCond1.column = instanceStatusCol;
instanceStatusCond1.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond1.value = TWProcessInstance.Statuses.Completed;
    
var instanceStatusCond2 = new TWSearchCondition();
instanceStatusCond2.column = instanceStatusCol;
instanceStatusCond2.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond2.value = TWProcessInstance.Statuses.Failed;

var instanceStatusCond3 = new TWSearchCondition();
instanceStatusCond3.column = instanceStatusCol;
instanceStatusCond3.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond3.value = TWProcessInstance.Statuses.Terminated;

var search = new TWSearch();
search.columns = new Array(instanceID,taskID,taskStatus,taskAssignment,taskName);
search.conditions = new Array(concurentCond,taskStatusCond,taskNameCond,instanceStatusCond1,instanceStatusCond2,instanceStatusCond3);
search.organizedBy = TWSearch.OrganizeByTypes.ProcessInstance;
search.orderBy = new Array();

//var instances = new TWProcessInstance();

var results =  search.execute();
//instances.
var count = results.rows.length;

logger.debug("+++++Search Result = "+count);

var concurentCases = "";
if (count > 0) {
    var row = results.rows[0];
    var esm_instance = row.values[0].toString();
    var task_id = row.values[1].toString();    
    logger.debug("ESM Instance ID : " + esm_instance); 
    logger.debug("Task ID : " + task_id);     
    
    var task = tw.system.findTaskByID(task_id);
    task.reassignTo("tw_admin");
    var user = tw.system.org.findUserByName("tw_admin");
    var inputVar = new tw.object.Map();
    inputVar.put("RESUMEDBY", "LTC");
    task.complete(user,inputVar);    
}    
    
    
 var errorPanel=dojo.byId("errorPanel");
errorPanel.innerHTML="";

if (event.type == "error"){
	var temp ="<ul>";
	for(var i=0;i<event.errors.length; i++){
		temp += "<li>"+event.errors[i].message+"</li>";
	}
	temp +="</ul>"
	errorPanel.innerHTML=temp;
}


log.info("ALL LOG START" +"Step: " + tw.local.Step + "Data" + tw.local.ccrisAuditTemp);

function executeQuery(sql) {
    var conn = null;
    var st = null;

    try {
        var ds = new Packages.javax.naming.InitialContext().lookup(tw.env.dataSourceName);
        conn = ds.getConnection();
        st = conn.prepareStatement(sql);

        try {
            var result = st.executeUpdate();
            log.info("result: " + result);
        } catch (e) {
            log.info("Insert Error >>>>: " + e);
        }

    } catch (e) {
        log.info("Error>>>>: " + e);
    } finally {
        if (st != null) st.close();
        if (conn != null) conn.close();
    }
}

function getInsertSQL(tmpAllFields,rowdata) {
    var SQL = "";
    if (tmpAllFields == null) {
        return SQL;
    } else if (tmpAllFields.length == 0) {
        return SQL;
    } else {
        var columns = "( ";
        var params = " VALUES ( ";
        for (var i = 0; i < tmpAllFields.length; i++) {

            if (i < tmpAllFields.length - 1) {
                columns += tmpAllFields[i] + ",";
                params += "'" + eval("rowdata." + tmpAllFields[i]) + "', ";
            } else {
                columns += tmpAllFields[i];
                params += "'" + eval("rowdata." + tmpAllFields[i]) + "'";
            }

        }
        columns = columns + " )";
        params = params + " )";

        SQL = columns + " " + params;
    }
    return SQL;
}

function getUpdateSQL(tmpAllFields,rowdata) {
    var SQL = "";
    if (tmpAllFields == null) {
        return SQL;
    } else if (tmpAllFields.length == 0) {
        return SQL;
    } else {
        var columnswithparam = "";
        for (var i = 0; i < tmpAllFields.length; i++) {

            if (i < tmpAllFields.length - 1) {
                columnswithparam += tmpAllFields[i] + "=";
                columnswithparam += "'" + eval("rowdata." + tmpAllFields[i]) + "', ";
            } else {
                columnswithparam += tmpAllFields[i] + "=";
                columnswithparam += "'" + eval("rowdata." + tmpAllFields[i]) + "'";
            }

        }
        columnswithparam = columnswithparam;


        SQL = columnswithparam;
    }
    return SQL;
}


var DBFacilityIDList = new tw.object.Map();
if (tw.local.fidlist != null && tw.local.fidlist != undefined && tw.local.fidlist.listLength > 0) {
    for (var x = 0; x < tw.local.fidlist.listLength; x++) {
        DBFacilityIDList.put(tw.local.fidlist[x].value,tw.local.fidlist[x].name);
    }
}



if (tw.local.ccrisAuditTemp != null && tw.local.ccrisAuditTemp != undefined) {
    var inscount = 0;
    var updcount = 0;
tw.local.ccrisInsertSql = new tw.object.listOf.String(); 
tw.local.ccrisUpdateSql = new tw.object.listOf.String(); 

    for (var i = 0; i < tw.local.ccrisAuditTemp.listLength; i++) {
    
 //   log.info( "insert" +tw.local.ccrisAuditTemp[i].FAC_ID)
        if (DBFacilityIDList.containsKey(tw.local.ccrisAuditTemp[i].FAC_ID) == false) {
 //         log.info( "insert" +tw.local.ccrisAuditTemp[i].FAC_ID);
            var tmpAllFields = tw.local.ccrisAuditTemp[i].propertyNames.reverse();
            var tempINSERTSQL = getInsertSQL(tmpAllFields,tw.local.ccrisAuditTemp[i]);
            if (tempINSERTSQL != null && tempINSERTSQL != "") {
                tempINSERTSQL = "INSERT INTO MYBOS.CCRIS_AUDIT" + tempINSERTSQL;
                tw.local.ccrisInsertSql[inscount] = tempINSERTSQL;
                inscount++;
            }
        } else {
//          log.info( "UPDATE" +tw.local.ccrisAuditTemp[i].FAC_ID);
            var tmpAllFields = tw.local.ccrisAuditTemp[i].propertyNames.reverse();
            var tempUPDATESQL = getUpdateSQL(tmpAllFields,tw.local.ccrisAuditTemp[i]);
            if (tempUPDATESQL != null && tempUPDATESQL != "") {
                tempUPDATESQL = "UPDATE MYBOS.CCRIS_AUDIT SET " + tempUPDATESQL + " WHERE " + "FAC_ID='" + tw.local.ccrisAuditTemp[i].FAC_ID + "'";
                tw.local.ccrisUpdateSql[updcount] = tempUPDATESQL;
                updcount++;
            }
        }
    }
}

if (tw.local.ccrisInsertSql != null && tw.local.ccrisInsertSql.listLength > 0) {
    for (var i = 0; i < tw.local.ccrisInsertSql.listLength; i++) {
         //log.info("Insert CCRIS AUDIT ############"+tw.local.ccrisInsertSql[i]);
        executeQuery(tw.local.ccrisInsertSql[i]);
    }
}
if (tw.local.ccrisUpdateSql != null && tw.local.ccrisUpdateSql.listLength > 0) {
    for (var j = 0; j < tw.local.ccrisUpdateSql.listLength; j++) {
           // log.info("UPDate CCRIS AUDIT ############"+tw.local.ccrisUpdateSql[j]);
        executeQuery(tw.local.ccrisUpdateSql[j]);
    }
}


// Display an area into which user details are displayed
var getOptionValue = function(context, name, defaultValue) {
	if (context.options[name] != undefined) {
		return context.options[name].get("value");
	}
	if (defaultValue != undefined) {
		return defaultValue;
	}
	return null;
};

// Define a refresh function that, when called, updates the area with the
// details of the user as retrieved by REST calls.
this._refresh = lang.hitch(this, function() {
	// If we have no variable bound to the control we have no userid to lookup
	// and hence there is nothing else to do.
	if (this.context.binding != undefined) {
	// Get the name of the user whos details we wish to look up.
		var userName = this.context.binding.get("value");
	// Build the XHR request arguments for the lookup
		var userLookupXHRArgs = {
			url: "/rest/bpm/wle/v1/user/" + userName,
			handleAs: "json",
	// Update the area with the user details
			load: lang.hitch(this, function(data) {
				html.set(query("*[id='userName']", this.context.element)[0], data.data.userName);
				html.set(query("*[id='fullName']", this.context.element)[0], data.data.fullName);
				html.set(query("*[id='email']", this.context.element)[0], data.data.emailAddress);
			}),
			error: lang.hitch(this, function(data) {
				html.set(query("*[id='userName']", this.context.element)[0], "");
				html.set(query("*[id='fullName']", this.context.element)[0], "");
				html.set(query("*[id='email']", this.context.element)[0], "");
			})
		};
	// Make the XHR request to lookup the data
		xhr.get(userLookupXHRArgs);
		
	// Build the XHR request to get the avatar image
		var imageArgs = {
			url: "/rest/bpm/wle/v1/avatar/" + userName,
			handleAs: "json",
			load: lang.hitch(this, function(data) {
				if (data.status == "200") {
					var value = "data:image/" + data.data.imageFormat + ";base64," + data.data.userAvatarImage;
				} else {
					var value = com_ibm_bpm_coach.getManagedAssetUrl("noImage.png", com_ibm_bpm_coach.assetType_WEB);
				}
				domAttr.set(query("*[id='avatar']", this.context.element)[0], "src", value);
			}),
			error: lang.hitch(this, function(data) {
				domAttr.set(query("*[id='avatar']", this.context.element)[0], "src", com_ibm_bpm_coach.getManagedAssetUrl("noImage.png", com_ibm_bpm_coach.assetType_WEB));
				console.log("Error!");
			})
		};
		xhr.get(imageArgs);
	}
});

// Handle the case where an error in configuration has been made and there
// is no bound variable.
if (this.context.binding == undefined) {
	domConstruct.create("div", {
		innerHTML: "Control: " + this.context.viewid + " - No bound variable",
		style: "color: red"
	}, this.context.element, "replace");
	return;
}

// Call the refresh function to display the details.
this._refresh();
// End of file
// End of file





var roleName = "caseRole_" + tw.local.caseSolutionId + "_" + tw.local.caseRoleId;
var roleDisplayName = roleName;
var roleDescription = "Internal BPM group that mirrors case role " + tw.local.caseRoleId + " from case solution " +  tw.local.caseSolutionId;

var internalCaseGroup = tw.system.org.findRoleByName(roleName);
if (internalCaseGroup == null ) {
   log.info("IBM Case Role TRS create internal BPM group " + roleName);
   internalCaseGroup = tw.system.org.createRole(roleName , roleDisplayName , roleDescription , false);
   if (internalCaseGroup == null) {
      internalCaseGroup = tw.system.org.findRoleByName(roleName);
   }
}

tw.local.team = new tw.object.Team();
tw.local.team.members = new tw.object.listOf.String();
tw.local.team.members[0] = internalCaseGroup.name;
if (tw.local.managerTeamName) {
   tw.local.team.managerTeam = tw.local.managerTeamName;
}


var _this = this;
var input = {text: this.context.options.service_option_name.get("value")};
var serviceArgs = {
  params: JSON.stringify(input),
  load: function(data) {
console.log("service returned: ", data);  
    // now dynamically create the img tag
    require(["dojo/_base/url"], function(url) {
       var relPath = new url(data.path).path;
       domConstruct.create("img", {src:relPath, style:"margin:5px 0px"}, _this.context.element, "first");     
    });
  },
  error: function(e) {console.log("service call failed: ", e);}
} 
this.context.options.service_name(serviceArgs);



<script>
function testBrowserCompatibility() {
    function getInternetExplorerVersion() {
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    }
    
    function isIEVersionLessThan9() {
        var result = false;
        var msg = "You're not using Windows Internet Explorer.";
        var ver = getInternetExplorerVersion();
        if (ver > -1) {
            if (ver >= 9.0) {
                msg = "You're using a supported version of Windows Internet Explorer."
            } else {
                msg = "You should upgrade your version of Windows Internet Explorer.";
                result = true;
            }
        }
        return result;
    }

    function getLocalizedMessages() {
        var messages = {};
        try {    
            // This is the "Portal Localized Messages Loader" AJAX Service from the Process Portal process app
            var serviceId = "1.39e9add2-4673-4f44-a422-21276fedc4dc";
            url = "/rest/bpm/wle/v1/service/" + serviceId + "?snapshotId=" + com_ibm_bpm_coach.projectsnapshot.TWP + "&action=start&createTask=false&parts=all";
            var xhr = new XMLHttpRequest();
            xhr.open("POST",url,false);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.send();
            var data = xhr.responseText;
            if (data) {
                data = JSON.parse(data);
            }
            if (data && data.data && data.data.data && data.data.data.output && data.data.data.output.items) {
                var items = data.data.data.output.items;
    
                for(var i = items.length; i > 0;) {
                    var item = items[--i];
                    messages[item.name] = item.value;
                }
            }
        } catch(e) {
            if (typeof console != "undefined") {
                console.log("Error fetching error message text via ajax: ", errorMsg);
            }
        }
        return messages;
    }

    if (isIEVersionLessThan9()) {
        var errorMsg = "You cannot view the Process Performance and Team Performance dashboards in Internet Explorer V8. You must use Internet Explorer V9 or another supported browser.";
        var nlMsgs = getLocalizedMessages();
        if (nlMsgs["error.browser.ie8"]) {
            errorMsg = nlMsgs["error.browser.ie8"];
        }

        alert(errorMsg);

        function addErrorMessage() {
            var errorDiv = document.getElementById("BPM_BROWSER_ERROR");
            if (!errorDiv) {
                var mainBodyDiv = document.getElementById("mainBody");
                if (mainBodyDiv && mainBodyDiv.style) {
                    mainBodyDiv.style.display = "none";
                }

                var errorDiv = document.createElement("div");
                errorDiv.id = errorDiv.className = "BPM_BROWSER_ERROR";

                var errorMessageContainerDiv = document.createElement("div");
                errorMessageContainerDiv.className = "errorMessageContainer";

                var errorMessageSpan = document.createElement("span");
                errorMessageSpan.innerHTML = errorMsg;

                errorMessageContainerDiv.appendChild(errorMessageSpan);
                errorDiv.appendChild(errorMessageContainerDiv);
                document.body.insertBefore(errorDiv, document.body.firstChild);
            }
        }
        
        var loadHandler = function() {
            addErrorMessage();
            window.detachEvent("onload", loadHandler);
        };
        var errorHandler = function() {
            window.detachEvent("onerror", errorHandler);
        };
        var readyStateHandler = function() {
            if (document.readyState == "complete") {
                addErrorMessage();
                document.detachEvent("onreadystatechange", readyStateHandler);
            }
        };

        window.attachEvent("onload", loadHandler);
        window.attachEvent("onerror", errorHandler);
        document.attachEvent("onreadystatechange", readyStateHandler);
    }
}
</script>




function addInst(name, classification, range){
    var inst = new tw.object.Instrument();
    inst.name = name;
    inst.classification = classification;
    inst.range = range;
    tw.local.temp.insertIntoList(0, inst);
}
if (tw.local.data == null){
    tw.local.data = new tw.object.Instrument();
    //tw.local.data.name = "Alto";
    //tw.local.data.classification = "Brass";
}
tw.local.temp = new tw.object.listOf.Instrument();
tw.local.results = new tw.object.listOf.Instrument();
addInst("Flute", "Woodwind", "Soprano");
addInst("Clarinet", "Woodwind", "Soprano");
addInst("Recorder", "Woodwind", "Soprano");
addInst("Violin", "String", "Soprano");
addInst("Trumpet", "Brass", "Soprano");
addInst("Oboe", "Woodwind", "Soprano");
addInst("Soprano Saxaphone", "Woodwind", "Soprano");
addInst("Alto Flute", "Woodwind", "Alto");
addInst("Viola", "String", "Alto");
addInst("French Horn", "Brass", "Alto");
addInst("Natural Horn", "Brass", "Alto");
addInst("Alto Horn", "Brass", "Alto");
addInst("Alto Saxophone", "Woodwind", "Alto");
addInst("English Horn", "Brass", "Alto");
addInst("Trombone", "Brass", "Tenor");
addInst("Tenor Saxophone", "Woodwind", "Tenor");
addInst("Cello", "String", "Baritone");
addInst("Baritone Horn", "Brass", "Baritone");
addInst("Bass Clarinet", "Woodwind", "Baritone");
addInst("Bassoon", "Woodwind", "Baritone");
addInst("Baritone Saxophone", "Woodwind", "Baritone");
addInst("Double Bass", "String", "Bass");
addInst("Tuba", "Brass", "Bass");
addInst("Bass Saxophone", "Woodwind", "Bass");
addInst("Flugelhorn", "Brass", "Soprano");
addInst("Piano", "Percussion", "-");
addInst("Guitar", "String", "-");
addInst("Mandolin", "String", "Soprano");
addInst("Mandocello", "String", "Baritone");
addInst("Mandobass", "String", "Bass");
addInst("Harpsichord", "String", "-");
addInst("Banjo", "String", "-");

var myList = tw.local.temp;
var data = tw.local.data;
if ((data.name == "" || data.name == null)&& (data.classification == "" || data.classification == null) && (data.range == "" || data.range == null)){
    tw.local.results = tw.local.temp;
}
else{
    for (var i=0; i<myList.listLength; i++){
        if ((myList[i].name.search(data.name) != -1 || data.name == "" || data.name == null)
        && (myList[i].classification.search(data.classification) != -1 || data.classification == "" || data.classification == null)
        && (myList[i].range.search(data.range) != -1 || data.range == "" || data.range == null)){
            tw.local.results.insertIntoList(0, myList[i]);
        }
    }
}
var operations = {
	'==': function(a,b) { return a == b; },
	'<' : function(a,b) { return a < b; },
	'<=': function(a,b) { return a <= b; },
	'>=': function(a,b) { return a >= b; },
	'>' : function(a,b) { return a > b; },
	'!=': function(a,b) { return a != b; }
}


console.log( " data "  + operations['<='] (1,2) )


var today= new tw.object.Date();
var date = today.getDate();
if(date <10)
{
    date = "0"+date;
}

var month = today.getMonth()+1;
if(month < 10)
{
    month = "0"+month;
}
var year = today.getFullYear();
var hours = today.getHours();
if(hours < 10)
{
    hours = "0"+hours;
}
var minutes = today.getMinutes();
if(minutes < 10)
{
    minutes ="0"+minutes;
}
var seconds = today.getSeconds();
if(seconds < 10)
{
    seconds ="0"+seconds;
}

tw.local.currentDate = date+"/"+month+"/"+year+"("+hours+":"+minutes+":"+seconds+")";

log.info("AppNo" + tw.local.applicationNumber)
log.info("TeamName" + tw.local.teamName);

var userMatch = false;
if (tw.local.userName == null) {
    tw.local.userName = '';
}
tw.local.absentUser = new tw.object.Map();
// Commented by Vivek as calling fetch absent users in Init Qc for task reqassignment
/*  if(tw.local.results){

if(tw.local.results[0].rows){    
var len = tw.local.results[0].rows.listLength;
tw.local.absentUser = new tw.object.Map()
for(var i=0 ; i<len ; i++){
var userAbsent = tw.local.results[0].rows[i].indexedMap.USER_CD;
tw.local.absentUser.put(userAbsent, userAbsent)
}
}
}  */
if (tw.local.absentUserList && tw.local.absentUserList.listLength > 0) {
    tw.local.absentUser = new tw.object.Map()
    for (var i = 0; i < tw.local.absentUserList.listLength; i++) {
        var userAbsent = tw.local.absentUserList[i];
        tw.local.absentUser.put(userAbsent, userAbsent);
    }
}
log.info('userName' + tw.local.userName)
var filteredTeamList;
filteredTeamList = new tw.object.Team();
filteredTeamList.members = new tw.object.listOf.String();
//Commented as Users is not there in SIT
for (var i = 0; i < tw.local.absentUser.size(); i++) {
    if (tw.local.absentUser.containsKey(tw.local.userName)) {
        userMatch = true;
        break;
    }
}
log.info(userMatch);
if (tw.local.userName == "" || userMatch) {
    var team = tw.system.org.findTeamByName(tw.local.teamName.name);
    log.info('teamname' + team);
    for (var i = 0; i < team.allUsers.length; i++) {
        var userName = team.allUsers[i].name;
        log.info('UserFromTeam' + userName);
        //Commented as Users is not there in SIT
        if (!tw.local.absentUser.containsKey(userName)) {
            filteredTeamList.members.insertIntoList(filteredTeamList.members.listLength, userName);
        }
    }
}
/* else{
if(tw.local.userName!=""){
var name = tw.system.org.findUserByName(tw.local.userName)
if(name){

filteredTeam.members.insertIntoList(filteredTeam.members.listLength, name.name)      
}
}
}*/
if (filteredTeamList && filteredTeamList.members && filteredTeamList.members.listLength == 0) {
    if (tw.local.userName != "") {
        var name = tw.system.org.findUserByName(tw.local.userName);
        if (name) {
            filteredTeamList.members.insertIntoList(filteredTeamList.members.listLength, name.name);
        }
    }
}

tw.local.filteredTeam = filteredTeamList;

// added by aman
//if (filteredTeamList && filteredTeamList.members.listLength == 0) {
//    tw.local.filteredTeam = tw.local.teamName;
//}

/*if(tw.local.teamName){
var filteredTeam;
filteredTeam  = new tw.object.Team();
filteredTeam.members = new tw.object.listOf.String(); 
if(tw.local.teamName.name){   
var team = tw.system.org.findTeamByName(tw.local.teamName.name);                         
for(var i=0;i< team.allUsers.length;i++){
var userName = team.allUsers[i].name;
filteredTeam.members.insertIntoList(filteredTeam.members.listLength,userName);
}
} 
else if(tw.local.teamName.members && tw.local.teamName.members.listLength>0){
for(var i=0;i< tw.local.teamName.members.listLength ; i++){
 filteredTeam.members[i] = tw.local.teamName.members[i];
}
}         
tw.local.filteredTeam = filteredTeam;
}*/
log.info("#####" + tw.local.filteredTeam);



var logger = Packages.org.apache.log4j.Logger.getLogger(tw.env.NBLIFELOGGER);
var prefix = " ["+tw.local.POLICYNO+"-"+tw.system.process.instanceId+"] ";

logger.debug(prefix+"---------------------------");

if(tw.local.CONCURRENTPOLICY !=null) {
    tw.local.ISCONCURENT = tw.local.CONCURRENTPOLICY.search("-") > -1;
    if(tw.local.ISCONCURENT == false)
       tw.local.CONCURRENTPOLICY = ""; 
} else {
    tw.local.ISCONCURENT = false    
}

//[13Nov2018] Commented code for enhancement to have new Scan Sources for Esub/TH cases.  New Scan Source codes are now
//   in the environment variable.
//if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length == 2) {
//    tw.local.SCANSOURCE = tw.local.REFERENCENUMBER; 
//}else if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {
//    if(tw.local.REFERENCENUMBER.substr(0,2) == 'TH') {
//        tw.local.SCANSOURCE = 'TH';    
//    } else {
//        tw.local.SCANSOURCE = 'EZ'
//    }
//}



if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length == 2) {
    tw.local.SCANSOURCE = tw.local.REFERENCENUMBER; 
}else if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {

    var scansourcelist = tw.env.EZSUBSCANSOURCE;

    if(scansourcelist.search(tw.local.REFERENCENUMBER.substr(0,2))>=0) {
        tw.local.SCANSOURCE = tw.local.REFERENCENUMBER.substr(0,2);    
    } else {
        tw.local.SCANSOURCE = 'EZ';
    }            
}

var nonsubcmcode = tw.env.NONPOSCHANNEL;

if(tw.local.REFERENCENUMBER != null && tw.local.REFERENCENUMBER != '' && tw.local.REFERENCENUMBER.length > 2) {
    if(nonsubcmcode.search(tw.local.CHANNEL) < 0 && tw.local.SCANSOURCE == 'EZ')
    { tw.local.ISPOSUWCASE = true;  }
}

logger.debug(prefix+"START :"+tw.system.step.name);


var policyNo = "POLICYNO";
var processName = tw.system.process.name;

// Cond 1 "POLICYNO" == tw.local.POLICYNO
var policyCol = new TWSearchColumn();
policyCol.name = policyNo;
policyCol.type = TWSearchColumn.Types.BusinessData;

var policyCond = new TWSearchCondition();
policyCond.column = policyCol;
policyCond.operator = TWSearchCondition.Operations.Equals;
policyCond.value = tw.local.POLICYNO;

//Cond 2 Process instance name == tw.system.process.name

var processCol = new TWSearchColumn();
processCol.type = TWSearchColumn.Types.Process;
processCol.name = TWSearchColumn.ProcessColumns.Name;

var processCond = new TWSearchCondition();
processCond.column = processCol;
processCond.operator = TWSearchCondition.Operations.Equals;
processCond.value = processName;

//Cond 3 & 4 & 5 ProcessInstance Status != Completed || Failed || Terminated

var instanceStatusCol = new TWSearchColumn();
instanceStatusCol.type = TWSearchColumn.Types.ProcessInstance;
instanceStatusCol.name = TWSearchColumn.ProcessInstanceColumns.Status;
    
var instanceStatusCond1 = new TWSearchCondition();
instanceStatusCond1.column = instanceStatusCol;
instanceStatusCond1.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond1.value = TWProcessInstance.Statuses.Completed;
    
var instanceStatusCond2 = new TWSearchCondition();
instanceStatusCond2.column = instanceStatusCol;
instanceStatusCond2.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond2.value = TWProcessInstance.Statuses.Failed;

var instanceStatusCond3 = new TWSearchCondition();
instanceStatusCond3.column = instanceStatusCol;
instanceStatusCond3.operator = TWSearchCondition.Operations.NotEquals;
instanceStatusCond3.value = TWProcessInstance.Statuses.Terminated;

var search = new TWSearch();
search.columns = new Array(policyCol,processCol);
search.conditions = new Array(policyCond,processCond,instanceStatusCond1,instanceStatusCond2,instanceStatusCond3);
search.organizedBy = TWSearch.OrganizeByTypes.ProcessInstance;
search.orderBy = new Array();


var results = search.execute();
var count = results.rows.length;

logger.debug(prefix+"Search Result ="+count);

if(count < 2) {
    tw.local.DECISION = "NODUPLICATE";
} else {
    tw.local.DECISION = "DUPLICATE";
}

logger.debug(prefix+"DECISION ="+tw.local.DECISION); 

logger.debug(prefix+"END :"+tw.system.step.name);



  tw.local.taskLinkURL = "http://" + tw.local.serverHost + ":" + tw.local.port + "/teamworks/process.lsw?zWorkflowState=1&zTaskId=" + tw.local.taskID;


https://hostname:port/portal/jsp/inject?bpdinstanceid=INSTANCE_ID&action=i&flowobjeid=objectID;
/teamworks/process.lsw?zworkflowstate=1&zTASKSID=


"http://" + tw.local.serverHost + ":" + tw.local.port + "/teamworks/process.lsw?zWorkflowState=1&zTaskId=" + tw.local.taskID;


https://iflow.edelweisstokio.in/portal/jsp/inject



//Function to return array count
function clientLength(CL) {
    var length = 0
    if (CL && CL.listLength > 0) {
        length = CL.listLength
    }
    return length
}

//Add two function and remove duplicate
//Add two function and remove duplicate
function addListWithOutDup(list1, list2){
    var l1 = new tw.object.listOf.ClientSearchDetail();
    l1 = list1;
    var l2 = new tw.object.listOf.ClientSearchDetail();
    l2 = list2;
// Combining both the list
    var temp = new tw.object.listOf.ClientSearchDetail();
    if (l1 && l2 && l1.listLength > 0 && l2.listLength > 0) {
        for (var i = 0; i < l2.listLength; i++) {
            l1.insertIntoList(l1.listLength, l2[i])
        }
        temp = l1;
    } else if (l1 && l2 && l1.listLength > 0) {
        temp = l1;
    } else if (l1 && l2 && l2.listLength > 0) {
        temp = l2;
    } else {
        temp = l1;
    }
    
//Converting list to map to remove duplicate values
    var map = new tw.object.Map();
    if (temp && temp.listLength > 0) {
        for (var k = 0; k < temp.listLength; k++) {
            map.put(temp[k].clientType + temp[k].clientId, temp[k])
        }
    }

//converting back to list to return value
    tw.local.dummmy = map;
    if(tw.local.dummmy && tw.local.dummmy.keyArray().length > 0){
        var result = new tw.object.listOf.ClientSearchDetail();
        for (var i = 0; i < tw.local.dummmy.keyArray().length; i++) {
            if (tw.local.dummmy.get(tw.local.dummmy.keyArray()[i])) {
                result.insertIntoList(result.listLength, tw.local.dummmy.get(tw.local.dummmy.keyArray()[i]));
            }
        }
        return result;
    }
    return temp;
}


const calculate = (function() {
    const numbers = [31, 42, 5, 34, 8];

    return {
        multiply: function() {
            let result = numbers.reduce((accumulator, number) => {
                return accumulator * number;
            }, 1);

            console.log(result);
        },

        add: function() {
            let result = numbers.reduce((accumulator, number) => {
                return accumulator + number;
            }, 0);

            console.log(result);
        }
    }
})();

calculate.add(); // 120
