import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Calendar, Building, Moon } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { ModalForm } from "../components/ui/ModalForm";
import { DataTable } from "../components/ui/DataTable";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import {
  getCountdownData,
  addCountdownEntry,
  updateCountdownEntry,
  deleteCountdownEntry,
} from "../services/JsonService";
import { type CountdownData, type CountdownEntry } from "../types/index";
import { toast } from "sonner";

export const CountdownPage: React.FC = () => {
  const [countdownData, setCountdownData] = useState<CountdownData | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CountdownEntry | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    salesAgent: "",
    dealDate: "",
    companyName: "",
    totalNights: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const agents: Array<string> = [
    // "John Smith",
    // "Sarah Johnson",
    // "Mike Wilson",
    // "Emily Davis",
    // "David Brown",
  ];
  const fetchCountdownData = async () => {
    try {
      const data = await getCountdownData();
      setCountdownData(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCountdownData(); // wait for async data
        console.log("Loaded data:", data); // now this logs the correct data
        setCountdownData(data); // update state
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
    fetchCountdownData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.salesAgent) {
      newErrors.salesAgent = "Sales agent is required";
    }
    if (!formData.dealDate) {
      newErrors.dealDate = "Deal date is required";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.totalNights || Number(formData.totalNights) <= 0) {
      newErrors.totalNights = "Valid number of nights required";
    }
    if (Number(formData.totalNights) > 1000) {
      newErrors.totalNights = "Nights cannot exceed 1000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEntry = async () => {
    if (!validateForm()) return;

    const data = await addCountdownEntry({
      salesAgent: formData.salesAgent,
      dealDate: formData.dealDate,
      companyName: formData.companyName,
      totalNights: Number(formData.totalNights),
    });

    setCountdownData(data);
    fetchCountdownData();

    resetForm();
    setIsAddModalOpen(false);
    setShowAddForm(false);
    toast.success("Entry added successfully!");
  };

  const handleEditEntry = async () => {
    if (!validateForm() || !selectedEntry) return;

    const data = await updateCountdownEntry(selectedEntry.id, {
      salesAgent: formData.salesAgent,
      dealDate: formData.dealDate,
      companyName: formData.companyName,
      totalNights: Number(formData.totalNights),
    });

    setCountdownData(data);
    resetForm();
    setIsEditModalOpen(false);
    setSelectedEntry(null);
    fetchCountdownData();

    toast.success("Entry updated successfully!");
  };

  const handleDeleteEntry = async (entry: CountdownEntry) => {
    if (
      window.confirm(
        `Are you sure you want to delete the entry for ${entry.companyName}?`
      )
    ) {
      const data = await deleteCountdownEntry(entry.id);
      setCountdownData(data);
      fetchCountdownData();

      toast.success("Entry deleted successfully!");
    }
  };

  const openEditModal = (entry: CountdownEntry) => {
    setSelectedEntry(entry);
    setFormData({
      salesAgent: entry.salesAgent,
      dealDate: entry.dealDate,
      companyName: entry.companyName,
      totalNights: entry.totalNights.toString(),
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      salesAgent: "",
      dealDate: "",
      companyName: "",
      totalNights: "",
    });
    setErrors({});
  };

  const totalNights =
    countdownData?.entries.reduce((sum, entry) => sum + entry.totalNights, 0) ||
    0;
  const remainingTarget = (countdownData?.targetNights || 700) - totalNights;
  const progressPercentage =
    (totalNights / (countdownData?.targetNights || 700)) * 100;

  const columns = [
    {
      key: "salesAgent",
      label: "Sales Agent",
      sortable: true,
    },
    {
      key: "dealDate",
      label: "Deal Date",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
    },
    {
      key: "totalNights",
      label: "Total Nights",
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
  ];

  if (!countdownData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Countdown Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track deals and monitor progress towards target
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          Add Record <Plus></Plus>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Target Nights</p>
                <AnimatedNumber
                  value={countdownData.targetNights}
                  className="text-gray-900"
                />
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Moon className="text-blue-600" size={32} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="gradient" className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Total Nights</p>
                <AnimatedNumber value={totalNights} className="text-gray-900" />
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="text-green-600" size={32} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            variant="gradient"
            className={`border-l-4 ${remainingTarget >= 0 ? "border-orange-500" : "border-red-500"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Remaining Target</p>
                <AnimatedNumber
                  value={remainingTarget}
                  className={
                    remainingTarget >= 0 ? "text-gray-900" : "text-red-600"
                  }
                />
              </div>
              <div
                className={`w-16 h-16 ${remainingTarget >= 0 ? "bg-orange-100" : "bg-red-100"} rounded-full flex items-center justify-center`}
              >
                <Building
                  className={
                    remainingTarget >= 0 ? "text-orange-600" : "text-red-600"
                  }
                  size={32}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Progress Circle */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center">
            <h3 className="text-gray-900 mb-4">Progress to Target</h3>
            <ProgressCircle
              value={totalNights}
              max={countdownData.targetNights}
              size={200}
              strokeWidth={12}
              label={`${totalNights} / ${countdownData.targetNights} nights`}
            />
          </div>
          <div className="grid grid-cols-2 gap-6 flex-1 max-w-md">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-blue-600 mb-2">Total Deals</p>
              <AnimatedNumber
                value={countdownData.entries.length}
                className="text-blue-900"
              />
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-green-600 mb-2">Avg Nights/Deal</p>
              <AnimatedNumber
                value={
                  countdownData.entries.length > 0
                    ? Math.round(totalNights / countdownData.entries.length)
                    : 0
                }
                className="text-green-900"
              />
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-purple-600 mb-2">Completion</p>
              <span className="text-purple-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <p className="text-sm text-orange-600 mb-2">Status</p>
              <span className={`text-orange-900`}>
                {progressPercentage >= 100 ? "✓ Complete" : "In Progress"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Add Form (Slide Down) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card variant="glass">
              <h3 className="text-gray-900 mb-4">Quick Add Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField
                  label="Sales Agent"
                  name="salesAgent"
                  value={formData.salesAgent}
                  onChange={(e) =>
                    setFormData({ ...formData, salesAgent: e.target.value })
                  }
                  error={errors.salesAgent}
                  required
                />
                <InputField
                  label="Deal Date"
                  name="dealDate"
                  type="date"
                  value={formData.dealDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dealDate: e.target.value })
                  }
                  error={errors.dealDate}
                  required
                />
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  error={errors.companyName}
                  required
                />
                <InputField
                  label="Total Nights"
                  name="totalNights"
                  type="number"
                  value={formData.totalNights}
                  onChange={(e) =>
                    setFormData({ ...formData, totalNights: e.target.value })
                  }
                  error={errors.totalNights}
                  min={1}
                  max={1000}
                  required
                />
              </div>
              <div className="flex space-x-3 mt-4">
                <Button onClick={handleAddEntry}>Save Record</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Quick Add */}
      {!showAddForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            variant="ghost"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            Show Quick Add Form <Plus></Plus>
          </Button>
        </motion.div>
      )}

      {/* Data Table */}
      <Card>
        <h3 className="text-gray-900 mb-4">Deal Records</h3>
        <DataTable
          columns={columns}
          data={countdownData.entries}
          onEdit={openEditModal}
          onDelete={handleDeleteEntry}
          searchable
        />
      </Card>

      {/* Add Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New Deal Record"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddEntry();
          }}
          className="space-y-4"
        >
          <InputField
            label="Sales Agent"
            name="salesAgent"
            value={formData.salesAgent}
            onChange={(e) =>
              setFormData({ ...formData, salesAgent: e.target.value })
            }
            error={errors.salesAgent}
            placeholder="Enter agent name"
            required
          />

          <InputField
            label="Deal Date"
            name="dealDate"
            type="date"
            value={formData.dealDate}
            onChange={(e) =>
              setFormData({ ...formData, dealDate: e.target.value })
            }
            error={errors.dealDate}
            required
          />
          <InputField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            error={errors.companyName}
            placeholder="Enter company name"
            required
          />
          <InputField
            label="Total Number of Nights"
            name="totalNights"
            type="number"
            value={formData.totalNights}
            onChange={(e) =>
              setFormData({ ...formData, totalNights: e.target.value })
            }
            error={errors.totalNights}
            min={1}
            max={1000}
            placeholder="Enter number of nights"
            required
          />
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Record
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </ModalForm>

      {/* Edit Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
          resetForm();
        }}
        title="Edit Deal Record"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditEntry();
          }}
          className="space-y-4"
        >
          <InputField
            label="Sales Agent"
            name="salesAgent"
            value={formData.salesAgent}
            onChange={(e) =>
              setFormData({ ...formData, salesAgent: e.target.value })
            }
            error={errors.salesAgent}
            placeholder="Enter agent name"
            required
          />

          <InputField
            label="Deal Date"
            name="dealDate"
            type="date"
            value={formData.dealDate}
            onChange={(e) =>
              setFormData({ ...formData, dealDate: e.target.value })
            }
            error={errors.dealDate}
            required
          />
          <InputField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            error={errors.companyName}
            required
          />
          <InputField
            label="Total Number of Nights"
            name="totalNights"
            type="number"
            value={formData.totalNights}
            onChange={(e) =>
              setFormData({ ...formData, totalNights: e.target.value })
            }
            error={errors.totalNights}
            min={1}
            max={1000}
            required
          />
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Record
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedEntry(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
};
