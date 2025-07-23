import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter, School, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchFiltersProps {
  searchQuery: string;
  selectedSchool: string;
  selectedMajor: string;
  selectedTags: string[];
  availableSchools: string[];
  availableMajors: string[];
  availableTags: string[];
  onSearchChange: (query: string) => void;
  onSchoolChange: (school: string) => void;
  onMajorChange: (major: string) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export const SearchFilters = ({
  searchQuery,
  selectedSchool,
  selectedMajor,
  selectedTags,
  availableSchools,
  availableMajors,
  availableTags,
  onSearchChange,
  onSchoolChange,
  onMajorChange,
  onTagToggle,
  onClearFilters,
}: SearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasActiveFilters = selectedSchool || selectedMajor || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm tài liệu, tên file, mô tả..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border/50 focus:border-primary transition-colors"
        />
      </div>

      {/* Filter toggle and clear */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Bộ lọc {hasActiveFilters && `(${(selectedSchool ? 1 : 0) + (selectedMajor ? 1 : 0) + selectedTags.length})`}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border/50 rounded-lg bg-card">
          {/* School filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <School className="h-4 w-4 text-primary" />
              Trường
            </label>
            <Select value={selectedSchool || "all"} onValueChange={onSchoolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trường..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trường</SelectItem>
                {availableSchools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Major filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Ngành
            </label>
            <Select value={selectedMajor || "all"} onValueChange={onMajorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngành..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {availableMajors.map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSchool && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <School className="h-3 w-3" />
              {selectedSchool}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onSchoolChange("all")}
              />
            </Badge>
          )}
          {selectedMajor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {selectedMajor}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onMajorChange("all")}
              />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              #{tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Available tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Tags phổ biến:</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onTagToggle(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};