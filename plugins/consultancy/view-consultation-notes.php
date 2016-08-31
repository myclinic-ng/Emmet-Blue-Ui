<div ng-controller="humanResourcesDepartmentGroupsController as controller">
	<div class="panel panel-white zoomIn" >
		<div class="panel-heading">
			<h6 class="panel-title">Consultation Note Management</h6>
			<div class="heading-elements">
				<ul class="icons-list">
	        		<li><a data-action="reload" ng-click="reloadDepartmentGroupsTable()"></a></li>
	        	</ul>
	    	</div>
		</div>

		<div class="panel-body">
			<div class="table-responsive col-md-12">
				<table datatable="" dt-options="dtOptions" dt-columns="dtColumns" dt-instance="dtInstance" class="table table-condensed table-striped table-hover">

				</table>
			</div>
		</div>
	</div>